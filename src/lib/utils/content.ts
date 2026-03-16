import type { SvelteComponent } from 'svelte';

export interface BlogPost {
	title: string;
	slug: string;
	date: string;
	excerpt: string;
	featured: boolean;
	readingMinutes: number;
	image?: string;
	tags: string[];
}

export interface Project {
	title: string;
	slug: string;
	date: string;
	excerpt: string;
	image?: string;
	tags: string[];
	url?: string;
}

interface MdsvexModule {
	default: typeof SvelteComponent;
	metadata: Record<string, unknown>;
}

const blogModules = import.meta.glob<MdsvexModule>('/src/content/blog/*.svx', { eager: true });
const projectModules = import.meta.glob<MdsvexModule>('/src/content/projects/*.svx', { eager: true });

function extractSlug(path: string): string {
	return path.split('/').pop()!.replace('.svx', '');
}

export function getBlogPosts(): BlogPost[] {
	return Object.entries(blogModules)
		.map(([path, mod]) => ({
			...(mod.metadata as unknown as BlogPost),
			slug: mod.metadata.slug as string ?? extractSlug(path)
		}))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getProjects(): Project[] {
	return Object.entries(projectModules)
		.map(([path, mod]) => ({
			...(mod.metadata as unknown as Project),
			slug: mod.metadata.slug as string ?? extractSlug(path)
		}))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): { meta: BlogPost; component: typeof SvelteComponent } | undefined {
	const entry = Object.entries(blogModules).find(
		([path, mod]) => (mod.metadata.slug as string ?? extractSlug(path)) === slug
	);
	if (!entry) return undefined;
	const [path, mod] = entry;
	return {
		meta: { ...(mod.metadata as unknown as BlogPost), slug: mod.metadata.slug as string ?? extractSlug(path) },
		component: mod.default
	};
}
