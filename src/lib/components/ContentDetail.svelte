<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Component } from 'svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { formatDate } from '$lib/utils/formatDate';
	import { browser } from '$app/environment';
	import { reveal } from '$lib/actions/reveal';

	interface NavItem {
		slug: string;
		title: string;
		date: string;
	}

	interface Props {
		meta: {
			title: string;
			date: string;
			excerpt: string;
			readingMinutes?: number;
			image?: string;
			tags: string[];
			slug: string;
		};
		ContentComponent: Component;
		backHref: string;
		backLabel: string;
		routePrefix: string;
		navLabel: string;
		prev?: NavItem | null;
		next?: NavItem | null;
		related: { slug: string }[];
		relatedTitle: string;
		headerExtra?: Snippet;
		relatedCard: Snippet<[item: any, index: number]>;
	}

	let {
		meta,
		ContentComponent,
		backHref,
		backLabel,
		routePrefix,
		navLabel,
		prev = null,
		next = null,
		related,
		relatedTitle,
		headerExtra,
		relatedCard
	}: Props = $props();

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

{#key meta.slug}
{#if showProgressBar}
	<div class="progress-bar" style:width="{scrollProgress * 100}%"></div>
{/if}

<Seo title={meta.title} description={meta.excerpt} image={meta.image} />

<article class="detail container">
	<a href={backHref} class="detail__back">&larr; {backLabel}</a>
	<header class="detail__header">
		<div class="detail__meta">
			<time datetime={meta.date}>{formatDate(meta.date)}</time>
			{#if meta.readingMinutes}
				<span>&middot;</span>
				<span>{meta.readingMinutes} min read</span>
			{/if}
		</div>
		<h1 class="detail__title">{meta.title}</h1>
		{#if meta.tags.length}
			<div class="detail__tags">
				{#each meta.tags as tag}
					<span class="detail__tag">{tag}</span>
				{/each}
			</div>
		{/if}
		{#if headerExtra}
			{@render headerExtra()}
		{/if}
	</header>

	<div class="prose" bind:this={proseEl}>
		<ContentComponent />
	</div>

	{#if prev || next}
		<nav class="detail-nav" aria-label={navLabel} use:reveal={{ distance: '20px', duration: 500 }}>
			{#if prev}
				<a href="{routePrefix}{prev.slug}" class="detail-nav__link detail-nav__link--prev">
					<span class="detail-nav__direction">&larr; Older</span>
					<span class="detail-nav__title">{prev.title}</span>
					<time class="detail-nav__date" datetime={prev.date}>{formatDate(prev.date)}</time>
				</a>
			{:else}
				<div></div>
			{/if}
			{#if next}
				<a href="{routePrefix}{next.slug}" class="detail-nav__link detail-nav__link--next">
					<span class="detail-nav__direction">Newer &rarr;</span>
					<span class="detail-nav__title">{next.title}</span>
					<time class="detail-nav__date" datetime={next.date}>{formatDate(next.date)}</time>
				</a>
			{:else}
				<div></div>
			{/if}
		</nav>
	{/if}

	{#if related.length}
		<section class="related" use:reveal={{ distance: '20px', duration: 500 }}>
			<h2 class="related__title">{relatedTitle}</h2>
			<div class="related__grid">
				{#each related as item, i (item.slug)}
					{@render relatedCard(item, i)}
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

	.detail {
		padding-top: 7rem;
		padding-bottom: 4rem;
		max-width: var(--prose-width);
	}

	.detail__back {
		display: inline-block;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 2rem;
		transition: color var(--transition-fast);
	}

	.detail__back:hover {
		color: var(--color-text);
	}

	@media (min-width: 1100px) {
		.detail__back {
			display: none;
		}
	}

	.detail__header {
		margin-bottom: 2.5rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.detail__meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
	}

	.detail__title {
		font-size: var(--text-3xl);
		font-weight: 700;
		line-height: 1.15;
		margin-bottom: 1rem;
	}

	.detail__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.detail__tag {
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
	}

	.detail-nav {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-top: 4rem;
		padding-top: 2.5rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	.detail-nav__link {
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

	.detail-nav__link:hover {
		border-color: var(--color-border);
		transform: translateY(-2px);
	}

	.detail-nav__link--next {
		text-align: right;
	}

	.detail-nav__direction {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-accent);
	}

	.detail-nav__title {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-text);
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.detail-nav__date {
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
		.detail-nav {
			grid-template-columns: 1fr;
		}

		.detail-nav__link--next {
			text-align: left;
		}
	}
</style>
