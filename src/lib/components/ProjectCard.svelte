<script lang="ts">
	import type { Project } from '$lib/utils/content';
	import { getDemoComponent } from '$lib/registry/demoRegistry';
	import { browser } from '$app/environment';
	import { spotlight } from '$lib/actions/spotlight';
	import { reveal } from '$lib/actions/reveal';

	interface Props {
		project: Project;
		delay?: number;
	}

	const { project, delay = 0 }: Props = $props();

	// svelte-ignore state_referenced_locally
	const Demo = getDemoComponent(project.slug);

	let el: HTMLAnchorElement | undefined = $state();
	let active = $state(false);

	$effect(() => {
		if (!browser || !el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				active = entry.isIntersecting;
			},
			{ threshold: 0.2 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<a href="/projects/{project.slug}" class="project-card" use:spotlight use:reveal={{ delay, distance: '20px', duration: 500 }} bind:this={el}>
	{#if Demo}
		<div class="project-card__demo" aria-hidden="true">
			<Demo {active} />
		</div>
	{:else if project.image}
		<img src={project.image} alt={project.title} class="project-card__image" loading="lazy" />
	{:else}
		<div class="project-card__placeholder" aria-hidden="true">
			<span class="project-card__placeholder-icon">&lt;/&gt;</span>
		</div>
	{/if}
	<div class="project-card__body">
		<h3 class="project-card__title">{project.title}</h3>
		<p class="project-card__excerpt">{project.excerpt}</p>
		{#if project.tags.length}
			<div class="project-card__tags">
				{#each project.tags as tag}
					<span class="project-card__tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</div>
</a>

<style>
	.project-card {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-2xl);
		overflow: hidden;
		transition:
			transform 250ms var(--ease-spring),
			box-shadow var(--transition-base),
			border-color var(--transition-base);
		box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
	}

	.project-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: radial-gradient(
			600px circle at var(--mouse-x, -600px) var(--mouse-y, -600px),
			rgba(255, 255, 255, 0.05),
			transparent 40%
		);
		opacity: 0;
		transition: opacity 300ms ease;
		pointer-events: none;
		z-index: 10;
	}

	.project-card:hover::before {
		opacity: 1;
	}

	.project-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		border-color: var(--color-border);
	}

	.project-card:active {
		transform: scale(0.98);
		transition: transform var(--transition-fast);
	}

	.project-card:focus-visible {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		border-color: var(--color-border);
	}

	.project-card__demo {
		flex: 1 1 0;
		min-height: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.project-card__image {
		width: 100%;
		flex: 1 1 0;
		min-height: 0;
		object-fit: cover;
	}

	.project-card__placeholder {
		width: 100%;
		flex: 1 1 0;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-bg-subtle) 0%, var(--color-surface) 100%);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.project-card__placeholder-icon {
		font-family: var(--font-mono);
		font-size: var(--text-2xl);
		color: var(--color-border);
		opacity: 0.5;
	}

	.project-card__body {
		padding: 1.25rem;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.project-card__title {
		font-family: var(--font-body);
		font-size: var(--text-3xl);
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: 0.5rem;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.project-card__excerpt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: 1.5;
		margin-bottom: 0.75rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.project-card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
		margin-top: auto;
		overflow: hidden;
	}

	.project-card__tag {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.25rem 0.75rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border-subtle);
		border-radius: 100px;
		color: var(--color-text-muted);
	}

	@media (max-width: 768px) {
		.project-card__title {
			font-size: var(--text-2xl);
		}

		.project-card__body {
			padding: 1rem;
		}
	}
</style>
