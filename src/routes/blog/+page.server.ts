import { error } from '@sveltejs/kit';
import { sanityQuery } from '$lib/server/sanity';
import type { PageServerLoad } from './$types';

type BlogPost = {
	_id: string;
	title: string;
	slug: string;
	excerpt: string;
	publishedAt: string;
	readingMinutes?: number;
	featured?: boolean;
};

type MonthlyCount = {
	label: string;
	count: number;
};

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	const query = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
		_id,
		title,
		"slug": slug.current,
		excerpt,
		publishedAt,
		readingMinutes,
		featured
	}`;

	try {
		const posts = await sanityQuery<BlogPost[]>(fetch, query);
		const totalPosts = posts.length;
		const featuredPosts = posts.filter((post) => post.featured).length;

		const monthLabels = Array.from({ length: 6 }, (_, idx) => {
			const date = new Date();
			date.setMonth(date.getMonth() - (5 - idx));
			return date.toLocaleDateString('en-US', { month: 'short' });
		});

		const monthlyMap = new Map<string, number>(monthLabels.map((label) => [label, 0]));
		for (const post of posts) {
			const postLabel = new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short' });
			if (monthlyMap.has(postLabel)) {
				monthlyMap.set(postLabel, (monthlyMap.get(postLabel) ?? 0) + 1);
			}
		}

		const monthlyCounts: MonthlyCount[] = monthLabels.map((label) => ({
			label,
			count: monthlyMap.get(label) ?? 0
		}));

		setHeaders({
			'cache-control': 'public, max-age=0, s-maxage=120, stale-while-revalidate=300'
		});

		return {
			posts,
			metrics: {
				totalPosts,
				featuredPosts,
				latestPublishedAt: posts[0]?.publishedAt ?? null,
				monthlyCounts
			},
			authError: false
		};
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : '';
		const isAuthError = message.includes('status 401') || message.includes('status 403');
		console.error('Failed to load blog posts from Sanity', cause);

		if (isAuthError) {
			const monthLabels = Array.from({ length: 6 }, (_, idx) => {
				const date = new Date();
				date.setMonth(date.getMonth() - (5 - idx));
				return date.toLocaleDateString('en-US', { month: 'short' });
			});

			return {
				posts: [],
				metrics: {
					totalPosts: 0,
					featuredPosts: 0,
					latestPublishedAt: null,
					monthlyCounts: monthLabels.map((label) => ({ label, count: 0 }))
				},
				authError: true
			};
		}

		throw error(503, 'Unable to load blog posts right now.');
	}
};
