import { getBlogPosts } from '$lib/utils/content';

export function load() {
	return { posts: getBlogPosts() };
}
