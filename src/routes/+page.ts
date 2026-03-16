import { getBlogPosts, getProjects } from '$lib/utils/content';

export function load() {
	return {
		posts: getBlogPosts().slice(0, 3),
		projects: getProjects().slice(0, 4)
	};
}
