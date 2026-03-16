import { getBlogPosts, getProjects } from '$lib/utils/content';

const FEATURED_PROJECT_SLUGS = ['aether-interface', 'nura-health'];
const FEATURED_POST_SLUGS = ['interactive-particle-networks', 'inheritance-as-abstraction'];

export function load() {
	const projects = getProjects();
	const posts = getBlogPosts();

	return {
		featuredProjects: FEATURED_PROJECT_SLUGS
			.map((slug) => projects.find((p) => p.slug === slug))
			.filter(Boolean),
		featuredPosts: FEATURED_POST_SLUGS
			.map((slug) => posts.find((p) => p.slug === slug))
			.filter(Boolean)
	};
}
