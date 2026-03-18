<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ProjectsHero from '$lib/components/ProjectsHero.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import TagFilter from '$lib/components/TagFilter.svelte';
	import { getDemoComponent } from '$lib/registry/demoRegistry';
	import { browser } from '$app/environment';
	import { reveal } from '$lib/actions/reveal';
	import { spotlight } from '$lib/actions/spotlight';

	let { data } = $props();

	let featuredEl: HTMLAnchorElement | undefined = $state();
	let featuredActive = $state(false);

	$effect(() => {
		if (!browser || !featuredEl) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				featuredActive = entry.isIntersecting;
			},
			{ threshold: 0.2 }
		);
		observer.observe(featuredEl);
		return () => observer.disconnect();
	});

	let activeTag = $state<string | null>(null);

	const allTags = $derived(() => {
		const tagSet = new Set<string>();
		for (const p of data.projects) {
			for (const t of p.tags) tagSet.add(t);
		}
		return [...tagSet].sort();
	});

	const featured = $derived(data.projects[0] ?? null);

	const remaining = $derived(() => {
		const rest = data.projects.slice(1);
		if (!activeTag) return rest;
		return rest.filter((p) => p.tags.includes(activeTag!));
	});

	const featuredVisible = $derived(() => {
		if (!activeTag) return true;
		return featured?.tags.includes(activeTag!) ?? false;
	});
</script>

<Seo title="Projects" description="Things I've built." />

<ProjectsHero count={data.projects.length} />

<div class="projects-page container">
	{#if allTags().length > 1}
		<div class="projects-page__filters" use:reveal={{ delay: 100, distance: '12px' }}>
			<TagFilter tags={allTags()} {activeTag} onchange={(tag) => (activeTag = tag)} />
		</div>
	{/if}

	{#if featured && featuredVisible()}
		{@const FeaturedDemo = getDemoComponent(featured.slug)}
		<a
			href="/projects/{featured.slug}"
			class="featured"
			use:spotlight
			use:reveal={{ delay: 0, distance: '24px', duration: 600 }}
			bind:this={featuredEl}
		>
			{#if FeaturedDemo}
				<div class="featured__demo" aria-hidden="true">
					<FeaturedDemo active={featuredActive} />
				</div>
			{:else if featured.image}
				<img src={featured.image} alt={featured.title} class="featured__image" loading="eager" />
			{:else}
				<div class="featured__placeholder" aria-hidden="true">
					<span class="featured__placeholder-icon">&lt;/&gt;</span>
				</div>
			{/if}
			<div class="featured__overlay"></div>
			<div class="featured__body">
				<div class="featured__tags">
					{#each featured.tags as tag}
						<span class="featured__tag">{tag}</span>
					{/each}
				</div>
				<h2 class="featured__title">{featured.title}</h2>
				<p class="featured__excerpt">{featured.excerpt}</p>
				<span class="featured__link">
					View Project <span class="featured__arrow">&rarr;</span>
				</span>
			</div>
		</a>
	{/if}

	{#if remaining().length}
		<div class="grid">
			{#each remaining() as project, i (project.slug)}
				<ProjectCard {project} delay={i * 80} />
			{/each}
		</div>
	{:else if !featured || !featuredVisible()}
		<p class="projects-page__empty">No projects match this filter.</p>
	{/if}
</div>

<style>
	.projects-page {
		padding-bottom: 6rem;
	}

	.projects-page__filters {
		margin-bottom: 2.5rem;
	}

	/* Featured project - full-width lead card */
	.featured {
		position: relative;
		display: block;
		width: 100%;
		min-height: 24rem;
		border-radius: var(--radius-2xl);
		overflow: hidden;
		margin-bottom: 2.5rem;
		transition:
			transform 250ms var(--ease-spring),
			box-shadow var(--transition-base);
	}

	.featured::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: radial-gradient(
			800px circle at var(--mouse-x, -800px) var(--mouse-y, -800px),
			rgba(255, 255, 255, 0.06),
			transparent 40%
		);
		opacity: 0;
		transition: opacity 300ms ease;
		pointer-events: none;
		z-index: 4;
	}

	.featured:hover::before {
		opacity: 1;
	}

	.featured:hover {
		transform: translateY(-3px);
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
	}

	.featured__demo {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.featured__image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.featured__placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-bg-subtle) 0%, var(--color-surface) 100%);
	}

	.featured__placeholder-icon {
		font-family: var(--font-mono);
		font-size: var(--text-4xl);
		color: var(--color-border);
		opacity: 0.3;
	}

	.featured__overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(13, 13, 18, 0.95) 0%, rgba(13, 13, 18, 0.3) 60%, transparent 100%);
		z-index: 1;
	}

	.featured__body {
		position: relative;
		z-index: 2;
		padding: 2.5rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		min-height: 24rem;
	}

	.featured__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.featured__tag {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
		border: 1px solid rgba(201, 168, 76, 0.3);
		padding: 0.2rem 0.6rem;
		border-radius: var(--radius-sm);
	}

	.featured__title {
		font-size: var(--text-4xl);
		font-weight: 700;
		color: var(--color-text);
		line-height: 1.1;
		margin-bottom: 0.75rem;
	}

	.featured__excerpt {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: 1.6;
		max-width: 36rem;
		margin-bottom: 1.5rem;
	}

	.featured__link {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-accent);
	}

	.featured__arrow {
		display: inline-block;
		transition: transform 250ms var(--ease-out-expo);
	}

	.featured:hover .featured__arrow {
		transform: translateX(4px);
	}

	/* Grid */
	.grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
		grid-auto-rows: 28rem;
	}

	.projects-page__empty {
		color: var(--color-text-muted);
		text-align: center;
		padding: 4rem 0;
	}

	@media (max-width: 768px) {
		.featured__body {
			padding: 1.5rem;
			min-height: 20rem;
		}

		.featured__title {
			font-size: var(--text-3xl);
		}

		.featured {
			min-height: 20rem;
		}
	}
</style>
