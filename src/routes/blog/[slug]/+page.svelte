<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { formatDate } from '$lib/utils/formatDate';
	import { browser } from '$app/environment';

	let { data } = $props();

	let scrollProgress = $state(0);

	function handleScroll() {
		const docHeight = document.documentElement.scrollHeight - window.innerHeight;
		if (docHeight > 0) {
			scrollProgress = Math.min(window.scrollY / docHeight, 1);
		}
	}

	const reducedMotion = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const showProgressBar = browser && !reducedMotion;
</script>

<svelte:window onscroll={handleScroll} />

{#if showProgressBar}
	<div class="progress-bar" style:width="{scrollProgress * 100}%"></div>
{/if}

<Seo title={data.meta.title} description={data.meta.excerpt} image={data.meta.image} />

<article class="post container">
	<a href="/blog" class="post__back">&larr; Back to Blog</a>
	<header class="post__header">
		<div class="post__meta">
			<time datetime={data.meta.date}>{formatDate(data.meta.date)}</time>
			<span>&middot;</span>
			<span>{data.meta.readingMinutes} min read</span>
		</div>
		<h1 class="post__title">{data.meta.title}</h1>
		{#if data.meta.tags.length}
			<div class="post__tags">
				{#each data.meta.tags as tag}
					<span class="post__tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</header>
	<div class="prose">
		<data.component />
	</div>
</article>

<style>
	.progress-bar {
		position: fixed;
		top: 4rem;
		left: 0;
		height: 2px;
		background: var(--color-accent);
		z-index: 11;
		transition: width 50ms linear;
	}

	.post {
		padding-block: 4rem;
		max-width: var(--prose-width);
	}

	.post__back {
		display: inline-block;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 2rem;
		transition: color var(--transition-fast);
	}

	.post__back:hover {
		color: var(--color-text);
	}

	.post__header {
		margin-bottom: 2.5rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.post__meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
	}

	.post__title {
		font-size: var(--text-3xl);
		font-weight: 700;
		line-height: 1.15;
		margin-bottom: 1rem;
	}

	.post__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.post__tag {
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
	}
</style>
