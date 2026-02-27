import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const GITHUB_API = 'https://api.github.com';
const DEFAULT_LIMIT = 12;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_STALE_IF_ERROR_MS = 60 * 60 * 1000;

type GitHubRepo = {
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	stargazers_count: number;
	forks_count: number;
	language: string | null;
	updated_at: string;
	homepage: string | null;
	fork: boolean;
	archived: boolean;
};

type ProjectArticle = {
	id: string;
	name: string;
	description: string;
	repoUrl: string;
	homepage: string | null;
	stars: number;
	forks: number;
	language: string | null;
	updatedAt: string;
	readmeHtml: string | null;
};

type GitHubUserEvent = {
	type: string;
	created_at: string;
	payload?: {
		commits?: Array<{ sha: string }>;
	};
};

type ProjectsMetrics = {
	totalProjects: number;
	totalStars: number;
	totalForks: number;
	topLanguage: string | null;
	activeLast30Days: number;
	weeklyCommits: number[];
	totalCommits8Weeks: number;
};

type ProjectsPayload = {
	username: string;
	projects: ProjectArticle[];
	metrics: ProjectsMetrics;
	featuredProject: ProjectArticle | null;
};

type ProjectsCacheEntry = {
	key: string;
	value: ProjectsPayload;
	expiresAt: number;
	staleUntil: number;
};

let projectsCache: ProjectsCacheEntry | null = null;

function parsePositiveMs(value: string | undefined, fallback: number) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	const username = env.GITHUB_USERNAME ?? 'mkolnicki';
	const token = env.GITHUB_TOKEN;
	const limit = Number(env.GITHUB_PROJECTS_LIMIT ?? DEFAULT_LIMIT);
	const cacheTtlMs = parsePositiveMs(env.GITHUB_PROJECTS_CACHE_TTL_MS, DEFAULT_CACHE_TTL_MS);
	const staleIfErrorMs = parsePositiveMs(
		env.GITHUB_PROJECTS_STALE_IF_ERROR_MS,
		DEFAULT_STALE_IF_ERROR_MS
	);
	const cacheKey = `${username}:${limit}`;
	const now = Date.now();
	const cachedEntry = projectsCache?.key === cacheKey ? projectsCache : null;

	setHeaders({
		'cache-control': `public, max-age=0, s-maxage=${Math.floor(
			cacheTtlMs / 1000
		)}, stale-while-revalidate=${Math.floor(staleIfErrorMs / 1000)}`
	});

	if (cachedEntry && now < cachedEntry.expiresAt) {
		return cachedEntry.value;
	}

	const headers: HeadersInit = {
		Accept: 'application/vnd.github+json'
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const reposResponse = await fetch(
			`${GITHUB_API}/users/${username}/repos?sort=updated&per_page=${limit}&type=owner`,
			{ headers }
		);
		const eventsResponse = await fetch(
			`${GITHUB_API}/users/${username}/events/public?per_page=100`,
			{
				headers
			}
		);

		if (!reposResponse.ok) {
			if (cachedEntry && now < cachedEntry.staleUntil) {
				return cachedEntry.value;
			}
			throw error(reposResponse.status, 'Unable to load projects from GitHub right now.');
		}

		const repos = ((await reposResponse.json()) as GitHubRepo[])
			.filter((repo) => !repo.fork && !repo.archived)
			.slice(0, limit);

		const projects = await Promise.all(
			repos.map(async (repo): Promise<ProjectArticle> => {
				const readmeResponse = await fetch(`${GITHUB_API}/repos/${repo.full_name}/readme`, {
					headers: {
						...headers,
						Accept: 'application/vnd.github.html'
					}
				});

				let readmeHtml: string | null = null;
				if (readmeResponse.ok) {
					const contentType = readmeResponse.headers.get('content-type') ?? '';
					if (contentType.includes('application/json')) {
						const readmeData = (await readmeResponse.json()) as { content?: string };
						readmeHtml = readmeData.content ?? null;
					} else {
						readmeHtml = await readmeResponse.text();
					}
				}

				return {
					id: repo.full_name,
					name: repo.name,
					description: repo.description ?? 'No description provided yet.',
					repoUrl: repo.html_url,
					homepage: repo.homepage,
					stars: repo.stargazers_count,
					forks: repo.forks_count,
					language: repo.language,
					updatedAt: repo.updated_at,
					readmeHtml
				};
			})
		);

		const languageCounts = new Map<string, number>();
		for (const project of projects) {
			if (!project.language) continue;
			languageCounts.set(project.language, (languageCounts.get(project.language) ?? 0) + 1);
		}

		const topLanguage =
			[...languageCounts.entries()].sort(
				(a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
			)[0]?.[0] ?? null;

		const nowTimestamp = Date.now();
		const weekMs = 7 * 24 * 60 * 60 * 1000;
		const weeklyCommits = Array.from({ length: 8 }, () => 0);

		if (eventsResponse.ok) {
			const events = (await eventsResponse.json()) as GitHubUserEvent[];
			for (const event of events) {
				if (event.type !== 'PushEvent') continue;
				const eventTimestamp = Date.parse(event.created_at);
				if (!Number.isFinite(eventTimestamp)) continue;
				const ageWeeks = Math.floor((nowTimestamp - eventTimestamp) / weekMs);
				if (ageWeeks < 0 || ageWeeks >= weeklyCommits.length) continue;
				const bucketIndex = weeklyCommits.length - 1 - ageWeeks;
				weeklyCommits[bucketIndex] += Math.max(event.payload?.commits?.length ?? 0, 1);
			}
		}

		const metrics: ProjectsMetrics = {
			totalProjects: projects.length,
			totalStars: projects.reduce((sum, project) => sum + project.stars, 0),
			totalForks: projects.reduce((sum, project) => sum + project.forks, 0),
			topLanguage,
			activeLast30Days: projects.filter(
				(project) => nowTimestamp - Date.parse(project.updatedAt) <= 30 * 24 * 60 * 60 * 1000
			).length,
			weeklyCommits,
			totalCommits8Weeks: weeklyCommits.reduce((sum, value) => sum + value, 0)
		};

		const featuredProject =
			[...projects].sort(
				(a, b) => b.stars - a.stars || Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
			)[0] ?? null;

		const payload: ProjectsPayload = { username, projects, metrics, featuredProject };
		const fetchedAt = Date.now();
		projectsCache = {
			key: cacheKey,
			value: payload,
			expiresAt: fetchedAt + cacheTtlMs,
			staleUntil: fetchedAt + cacheTtlMs + staleIfErrorMs
		};

		return payload;
	} catch (err) {
		if (cachedEntry && Date.now() < cachedEntry.staleUntil) {
			return cachedEntry.value;
		}

		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}

		throw error(503, 'Unable to load projects from GitHub right now.');
	}
};
