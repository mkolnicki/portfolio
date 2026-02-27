import { error } from '@sveltejs/kit';
import { sanityQuery } from '$lib/server/sanity';
import type { PageServerLoad } from './$types';

type BlogPostDetail = {
	_id: string;
	title: string;
	excerpt: string;
	publishedAt: string;
	readingMinutes?: number;
	bodyText: string;
};

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
	const query = `*[_type == "post" && slug.current == $slug][0]{
		_id,
		title,
		excerpt,
		publishedAt,
		readingMinutes,
		"bodyText": pt::text(body)
	}`;

	try {
		const post = await sanityQuery<BlogPostDetail | null>(fetch, query, { slug: params.slug });

		if (!post) {
			throw error(404, 'Post not found.');
		}

		setHeaders({
			'cache-control': 'public, max-age=0, s-maxage=120, stale-while-revalidate=300'
		});

		return { post };
	} catch (cause) {
		if (typeof cause === 'object' && cause && 'status' in cause) {
			throw cause;
		}

		console.error('Failed to load blog post from Sanity', cause);
		throw error(503, 'Unable to load this post right now.');
	}
};
