import type { Component } from 'svelte';

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
	featured: boolean;
	readingMinutes: number;
	image?: string;
	tags: string[];
	github?: string;
}

interface MdsvexModule {
	default: Component;
	metadata: Record<string, unknown>;
}

const blogModules = import.meta.glob<MdsvexModule>('/src/content/blog/*.svx', { eager: true });
const projectModules = import.meta.glob<MdsvexModule>('/src/content/projects/*.svx', { eager: true });

function extractSlug(path: string): string {
	return path.split('/').pop()!.replace('.svx', '');
}

function getItems<T extends { date: string }>(modules: Record<string, MdsvexModule>): T[] {
	return Object.entries(modules)
		.map(([path, mod]) => ({
			...(mod.metadata as unknown as T),
			slug: (mod.metadata.slug as string) ?? extractSlug(path)
		}))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function getItemBySlug<T>(
	modules: Record<string, MdsvexModule>,
	slug: string
): { meta: T; component: Component } | undefined {
	const entry = Object.entries(modules).find(
		([path, mod]) => ((mod.metadata.slug as string) ?? extractSlug(path)) === slug
	);
	if (!entry) return undefined;
	const [path, mod] = entry;
	return {
		meta: {
			...(mod.metadata as unknown as T),
			slug: (mod.metadata.slug as string) ?? extractSlug(path)
		},
		component: mod.default
	};
}

export const getBlogPosts = () => getItems<BlogPost>(blogModules);
export const getProjects = () => getItems<Project>(projectModules);
export const getPostBySlug = (slug: string) => getItemBySlug<BlogPost>(blogModules, slug);
export const getProjectBySlug = (slug: string) => getItemBySlug<Project>(projectModules, slug);
