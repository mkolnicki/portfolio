<script lang="ts">
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
		/** 0–1 progress through this section's scroll range */
		progress?: number;
		/** 0–1 progress of the previous section (drives enter animation) */
		prevProgress?: number;
		/** Index in the stack (drives z-index) */
		index?: number;
		/** Total number of stacked sections */
		sectionCount?: number;
		/** Whether we're in stacked (desktop) mode */
		stacked?: boolean;
	}

	const {
		id,
		title,
		excerpt,
		tags,
		href,
		linkLabel = 'View project',
		demo,
		progress = 0,
		prevProgress = 0,
		index = 0,
		sectionCount = 1,
		stacked = false
	}: Props = $props();

	// Sequential carousel: current section exits fully, then next section enters.
	// No overlapping content at any point.

	// Exit: fully visible until progress 0.5, then fades out over 0.5→0.75
	const exitOpacity = $derived(stacked ? Math.max(0, Math.min(1, (0.75 - progress) / 0.25)) : 1);
	// Enter: fades in as the previous section's progress goes 0.75→1.0
	const enterOpacity = $derived(
		stacked && index > 0 ? Math.max(0, Math.min(1, (prevProgress - 0.75) / 0.25)) : 1
	);
	const opacity = $derived(Math.min(exitOpacity, enterOpacity));

	// Subtle vertical shift matched to each phase
	const exitY = $derived(stacked ? -Math.max(0, (progress - 0.5) / 0.25) * 30 : 0);
	const enterY = $derived(
		stacked && index > 0
			? Math.max(0, 1 - Math.max(0, (prevProgress - 0.75) / 0.25)) * 30
			: 0
	);
	const translateY = $derived(exitY + enterY);

	const active = $derived(stacked ? opacity > 0.1 : true);
	const visible = $derived(stacked ? opacity > 0.01 : true);
</script>

{#if stacked}
	<div
		class="showcase-card"
		style:opacity={opacity}
		style:transform="translateY({translateY}px)"
		style:visibility={visible ? 'visible' : 'hidden'}
		style:pointer-events={active ? 'auto' : 'none'}
	>
		<div class="showcase container" {id}>
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
{:else}
	<div class="mobile-section" {id}>
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
{/if}

<style>
	.showcase-card {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		will-change: opacity, transform;
	}

	.mobile-section {
		position: relative;
		padding: 3rem 0;
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
		.showcase {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.showcase__demo {
			max-height: 50vh;
		}
	}
</style>
