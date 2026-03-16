import { getProjects } from '$lib/utils/content';

export function load() {
	return { projects: getProjects() };
}
