<script lang="ts">
	import { browser } from '$app/environment';
	import { reveal } from '$lib/actions/reveal';
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		title: string;
		excerpt: string;
		tags: string[];
		href: string;
		linkLabel?: string;
		demo: Snippet<[boolean]>;
	}

	const { id, title, excerpt, tags, href, linkLabel = 'View project', demo }: Props = $props();

	let panel: HTMLDivElement | undefined = $state();
	let active = $state(false);

	$effect(() => {
		if (!browser || !panel) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				active = entry.isIntersecting;
			},
			{ threshold: 0.3 }
		);
		observer.observe(panel);
		return () => observer.disconnect();
	});
</script>

<div class="sticky-wrapper" {id}>
	<div class="sticky-panel" bind:this={panel}>
		<div class="showcase container">
			<div class="showcase__demo">
				{@render demo(active)}
			</div>
			<div class="showcase__meta" use:reveal>
				<div class="showcase__tags">
					{#each tags as tag (tag)}
						<span class="tag">{tag}</span>
					{/each}
				</div>
				<h3 class="showcase__title">{title}</h3>
				<p class="showcase__excerpt">{excerpt}</p>
				<a class="showcase__link" {href}>
					{linkLabel}
					<span aria-hidden="true">&rarr;</span>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.sticky-wrapper {
		height: 150vh;
		position: relative;
	}

	.sticky-panel {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		background: var(--color-bg);
	}

	.showcase {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: 3rem;
		align-items: center;
		width: 100%;
	}

	.showcase__demo {
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.showcase__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.tag {
		font-size: 0.7rem;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
		border: 1px solid var(--color-border);
		padding: 0.2rem 0.6rem;
		border-radius: var(--radius-sm);
	}

	.showcase__title {
		font-size: var(--text-2xl);
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.showcase__excerpt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.showcase__link {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-accent);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.showcase__link:hover {
		color: var(--color-accent-hover);
	}

	.showcase__link span {
		display: inline-block;
		transition: transform var(--transition-fast);
	}

	.showcase__link:hover span {
		transform: translateX(4px);
	}

	@media (max-width: 768px) {
		.sticky-wrapper {
			height: auto;
		}

		.sticky-panel {
			position: relative;
			height: auto;
			padding: 3rem 0;
		}

		.showcase {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}
</style>
