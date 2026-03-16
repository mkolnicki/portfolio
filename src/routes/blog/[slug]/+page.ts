import { error } from '@sveltejs/kit';
import { getPostBySlug, getBlogPosts } from '$lib/utils/content';

export function load({ params }) {
	const result = getPostBySlug(params.slug);
	if (!result) throw error(404, 'Post not found');

	const allPosts = getBlogPosts();
	const currentIndex = allPosts.findIndex((p) => p.slug === params.slug);

	const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
	const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

	const currentTags = new Set(result.meta.tags);
	const related = allPosts
		.filter((p) => p.slug !== params.slug)
		.map((p) => ({ post: p, overlap: p.tags.filter((t) => currentTags.has(t)).length }))
		.filter((r) => r.overlap > 0)
		.sort((a, b) => b.overlap - a.overlap)
		.slice(0, 3)
		.map((r) => r.post);

	return {
		meta: result.meta,
		component: result.component,
		prevPost,
		nextPost,
		related
	};
}
