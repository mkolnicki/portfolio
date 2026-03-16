import { error } from '@sveltejs/kit';
import { getProjectBySlug, getProjects } from '$lib/utils/content';

export function load({ params }) {
	const result = getProjectBySlug(params.slug);
	if (!result) throw error(404, 'Project not found');

	const allProjects = getProjects();
	const currentIndex = allProjects.findIndex((p) => p.slug === params.slug);

	const prevProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
	const nextProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;

	const currentTags = new Set(result.meta.tags);
	const related = allProjects
		.filter((p) => p.slug !== params.slug)
		.map((p) => ({ project: p, overlap: p.tags.filter((t) => currentTags.has(t)).length }))
		.filter((r) => r.overlap > 0)
		.sort((a, b) => b.overlap - a.overlap)
		.slice(0, 3)
		.map((r) => r.project);

	return {
		meta: result.meta,
		component: result.component,
		prevProject,
		nextProject,
		related
	};
}
