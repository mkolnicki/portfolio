<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { formatDate } from '$lib/utils/formatDate';
	import { browser } from '$app/environment';
	import { reveal } from '$lib/actions/reveal';

	let { data } = $props();

	let scrollProgress = $state(0);
	let proseEl: HTMLElement | undefined = $state();

	function handleScroll() {
		if (!proseEl) return;
		const rect = proseEl.getBoundingClientRect();
		const proseEndFromTop = rect.bottom + window.scrollY;
		const scrollTarget = proseEndFromTop - window.innerHeight;
		if (scrollTarget > 0) {
			scrollProgress = Math.min(Math.max(window.scrollY / scrollTarget, 0), 1);
		}
	}

	const reducedMotion = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const showProgressBar = browser && !reducedMotion;
</script>

<svelte:window onscroll={handleScroll} />

{#key data.meta.slug}
{#if showProgressBar}
	<div class="progress-bar" style:width="{scrollProgress * 100}%"></div>
{/if}

<Seo title={data.meta.title} description={data.meta.excerpt} image={data.meta.image} />

<article class="project container">
	<a href="/projects" class="project__back">&larr; Back to Projects</a>
	<header class="project__header">
		<div class="project__meta">
			<time datetime={data.meta.date}>{formatDate(data.meta.date)}</time>
			{#if data.meta.readingMinutes}
				<span>&middot;</span>
				<span>{data.meta.readingMinutes} min read</span>
			{/if}
		</div>
		<h1 class="project__title">{data.meta.title}</h1>
		{#if data.meta.tags.length}
			<div class="project__tags">
				{#each data.meta.tags as tag}
					<span class="project__tag">{tag}</span>
				{/each}
			</div>
		{/if}
		{#if data.meta.github}
			<a href={data.meta.github} class="project__github" target="_blank" rel="noopener noreferrer">
				<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
					<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
						0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
						-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2
						-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82
						.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08
						2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
						1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
				</svg>
				View on GitHub
				<span class="project__github-arrow">&nearr;</span>
			</a>
		{/if}
	</header>

	<div class="prose" bind:this={proseEl}>
		<data.component />
	</div>

	{#if data.prevProject || data.nextProject}
		<nav class="project-nav" aria-label="Project navigation" use:reveal={{ distance: '20px', duration: 500 }}>
			{#if data.prevProject}
				<a href="/projects/{data.prevProject.slug}" class="project-nav__link project-nav__link--prev">
					<span class="project-nav__direction">&larr; Older</span>
					<span class="project-nav__title">{data.prevProject.title}</span>
					<time class="project-nav__date" datetime={data.prevProject.date}>{formatDate(data.prevProject.date)}</time>
				</a>
			{:else}
				<div></div>
			{/if}
			{#if data.nextProject}
				<a href="/projects/{data.nextProject.slug}" class="project-nav__link project-nav__link--next">
					<span class="project-nav__direction">Newer &rarr;</span>
					<span class="project-nav__title">{data.nextProject.title}</span>
					<time class="project-nav__date" datetime={data.nextProject.date}>{formatDate(data.nextProject.date)}</time>
				</a>
			{:else}
				<div></div>
			{/if}
		</nav>
	{/if}

	{#if data.related.length}
		<section class="related" use:reveal={{ distance: '20px', duration: 500 }}>
			<h2 class="related__title">Related Projects</h2>
			<div class="related__grid">
				{#each data.related as project, i (project.slug)}
					<ProjectCard {project} delay={i * 100} />
				{/each}
			</div>
		</section>
	{/if}
</article>
{/key}

<style>
	.progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		height: 2px;
		background: var(--color-accent);
		z-index: 51;
		transition: width 50ms linear;
	}

	.project {
		padding-top: 7rem;
		padding-bottom: 4rem;
		max-width: var(--prose-width);
	}

	.project__back {
		display: inline-block;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 2rem;
		transition: color var(--transition-fast);
	}

	.project__back:hover {
		color: var(--color-text);
	}

	@media (min-width: 1100px) {
		.project__back {
			display: none;
		}
	}

	.project__header {
		margin-bottom: 2.5rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.project__meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
	}

	.project__title {
		font-size: var(--text-3xl);
		font-weight: 700;
		line-height: 1.15;
		margin-bottom: 1rem;
	}

	.project__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.project__tag {
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
	}

	.project__github {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-text-muted);
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.project__github:hover {
		color: var(--color-text);
		border-color: var(--color-border);
		background: var(--color-bg-subtle);
	}

	.project__github-arrow {
		font-size: 0.85em;
		transition: transform 200ms var(--ease-out-expo);
	}

	.project__github:hover .project__github-arrow {
		transform: translate(2px, -2px);
	}

	.project-nav {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-top: 4rem;
		padding-top: 2.5rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	.project-nav__link {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 1.25rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface);
		transition:
			border-color var(--transition-fast),
			transform 200ms var(--ease-spring);
	}

	.project-nav__link:hover {
		border-color: var(--color-border);
		transform: translateY(-2px);
	}

	.project-nav__link--next {
		text-align: right;
	}

	.project-nav__direction {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-accent);
	}

	.project-nav__title {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-text);
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.project-nav__date {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.related {
		margin-top: 4rem;
		padding-top: 2.5rem;
		border-top: 1px solid var(--color-border-subtle);
		max-width: var(--max-width);
	}

	.related__title {
		font-size: var(--text-xl);
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: var(--color-text);
	}

	.related__grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
		grid-auto-rows: 22rem;
	}

	@media (max-width: 768px) {
		.project-nav {
			grid-template-columns: 1fr;
		}

		.project-nav__link--next {
			text-align: left;
		}
	}
</style>
