<script lang="ts">
	import { onMount } from 'svelte';
	import type { BlogPost } from '$lib/utils/content';

	let { posts }: { posts: BlogPost[] } = $props();

	let cards = $state(
		posts.map((post, i) => ({
			id: i + 1,
			title: post.title,
			text: post.excerpt
		}))
	);

	onMount(() => {
		const interval = setInterval(() => {
			const last = cards[cards.length - 1];
			cards = [last, ...cards.slice(0, -1)];
		}, 3000);

		return () => clearInterval(interval);
	});
</script>

<div class="feature-card">
	<div class="feature-card__header">
		<h3 class="feature-card__title">Latest Writing</h3>
		<p class="feature-card__subtitle">Recent blog posts</p>
	</div>
	<div class="shuffler">
		{#each cards as card, index (card.id)}
			<div
				class="shuffler__item"
				style="
					transform: translateY({index}rem) scale({1 - index * 0.05});
					opacity: {1 - index * 0.2};
					z-index: {10 - index};
				"
			>
				<div class="shuffler__item-id">{card.id.toString().padStart(2, '0')}</div>
				<div class="shuffler__item-content">
					<div class="shuffler__item-title">{card.title}</div>
					<div class="shuffler__item-text">{card.text}</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.feature-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-2xl);
		padding: 2rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		box-shadow: 0 12px 32px rgba(0,0,0,0.3);
		position: relative;
		overflow: hidden;
	}

	.feature-card__header {
		margin-bottom: 2rem;
	}

	.feature-card__title {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-lg);
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.feature-card__subtitle {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.shuffler {
		position: relative;
		height: 200px;
		display: flex;
		justify-content: center;
		margin-top: auto;
	}

	.shuffler__item {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 600ms ease, z-index 0ms;
		will-change: transform, opacity;
	}

	.shuffler__item-id {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--color-accent);
		font-weight: 600;
	}

	.shuffler__item-title {
		font-weight: 600;
		font-size: var(--text-base);
		color: var(--color-text);
	}

	.shuffler__item-text {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
</style>
