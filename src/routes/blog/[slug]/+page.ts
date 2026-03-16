import { error } from '@sveltejs/kit';
import { getPostBySlug } from '$lib/utils/content';

export function load({ params }) {
	const result = getPostBySlug(params.slug);
	if (!result) throw error(404, 'Post not found');
	return { meta: result.meta, component: result.component };
}
