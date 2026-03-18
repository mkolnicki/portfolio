<script lang="ts">
	import type { BlogPost } from '$lib/utils/content';
	import { getDemoComponent } from '$lib/registry/demoRegistry';
	import { browser } from '$app/environment';
	import { formatDate } from '$lib/utils/formatDate';
	import { spotlight } from '$lib/actions/spotlight';
	import { reveal } from '$lib/actions/reveal';

	interface Props {
		post: BlogPost;
	}

	const { post }: Props = $props();

	// svelte-ignore state_referenced_locally
	const Demo = getDemoComponent(post.slug);

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

<a href="/blog/{post.slug}" class="featured-post" use:spotlight use:reveal={{ delay: 0, distance: '24px', duration: 600 }} bind:this={el}>
	{#if Demo}
		<div class="featured-post__demo" aria-hidden="true">
			<Demo {active} />
		</div>
	{:else if post.image}
		<img src={post.image} alt={post.title} class="featured-post__image" loading="eager" />
	{:else}
		<div class="featured-post__placeholder" aria-hidden="true"></div>
	{/if}
	<div class="featured-post__overlay"></div>
	<div class="featured-post__body">
		<div class="featured-post__meta">
			<span class="featured-post__badge">Featured</span>
			<time datetime={post.date}>{formatDate(post.date)}</time>
			<span>&middot;</span>
			<span>{post.readingMinutes} min read</span>
		</div>
		<h2 class="featured-post__title">{post.title}</h2>
		<p class="featured-post__excerpt">{post.excerpt}</p>
		<div class="featured-post__footer">
			{#if post.tags.length}
				<div class="featured-post__tags">
					{#each post.tags as tag}
						<span class="featured-post__tag">{tag}</span>
					{/each}
				</div>
			{/if}
			<span class="featured-post__link">
				Read article <span class="featured-post__arrow">&rarr;</span>
			</span>
		</div>
	</div>
</a>

<style>
	.featured-post {
		position: relative;
		display: block;
		width: 100%;
		min-height: 22rem;
		border-radius: var(--radius-2xl);
		overflow: hidden;
		transition:
			transform 250ms var(--ease-spring),
			box-shadow var(--transition-base);
	}

	.featured-post::before {
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

	.featured-post:hover::before {
		opacity: 1;
	}

	.featured-post:hover {
		transform: translateY(-3px);
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
	}

	.featured-post__demo {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.featured-post__image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.featured-post__placeholder {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, var(--color-bg-subtle) 0%, var(--color-surface) 100%);
	}

	.featured-post__overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(13, 13, 18, 0.95) 0%, rgba(13, 13, 18, 0.4) 50%, rgba(13, 13, 18, 0.15) 100%);
		z-index: 1;
	}

	.featured-post__body {
		position: relative;
		z-index: 2;
		padding: 2.5rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		min-height: 22rem;
	}

	.featured-post__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.5rem;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
	}

	.featured-post__badge {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-bg);
		background: var(--color-accent);
		padding: 0.15rem 0.5rem;
		border-radius: var(--radius-sm);
		font-weight: 600;
		margin-right: 0.25rem;
	}

	.featured-post__title {
		font-size: var(--text-4xl);
		font-weight: 700;
		color: var(--color-text);
		line-height: 1.1;
		margin-bottom: 0.75rem;
		max-width: 36rem;
	}

	.featured-post__excerpt {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: 1.6;
		max-width: 36rem;
		margin-bottom: 1.5rem;
	}

	.featured-post__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.featured-post__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.featured-post__tag {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
		border: 1px solid rgba(201, 168, 76, 0.3);
		padding: 0.2rem 0.6rem;
		border-radius: var(--radius-sm);
	}

	.featured-post__link {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-accent);
	}

	.featured-post__arrow {
		display: inline-block;
		transition: transform 250ms var(--ease-out-expo);
	}

	.featured-post:hover .featured-post__arrow {
		transform: translateX(4px);
	}

	@media (max-width: 768px) {
		.featured-post__body {
			padding: 1.5rem;
		}

		.featured-post__title {
			font-size: var(--text-3xl);
		}
	}
</style>
