<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	let { data } = $props();
</script>

<Seo title="Projects" description="Things I've built." />

<div class="projects-page container">
	<header class="projects-page__header">
		<h1 class="projects-page__title">Projects</h1>
		<p class="projects-page__desc">Things I've built.</p>
	</header>

	{#if data.projects.length}
		<div class="grid">
			{#each data.projects as project}
				<ProjectCard {project} />
			{/each}
		</div>
	{:else}
		<p class="projects-page__empty">No projects yet. Check back soon.</p>
	{/if}
</div>

<style>
	.projects-page {
		padding-block: 4rem;
	}

	.projects-page__header {
		margin-bottom: 2.5rem;
	}

	.projects-page__title {
		font-size: var(--text-3xl);
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.projects-page__desc {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
	}

	.grid {
		display: grid;
		gap: 2.5rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
		grid-auto-rows: 28rem;
	}

	.projects-page__empty {
		color: var(--color-text-muted);
	}
</style>
