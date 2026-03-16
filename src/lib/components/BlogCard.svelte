<script lang="ts">
	import type { BlogPost } from '$lib/utils/content';
	import { formatDate } from '$lib/utils/formatDate';
	import { spotlight } from '$lib/actions/spotlight';
	import { reveal } from '$lib/actions/reveal';

	interface Props {
		post: BlogPost;
	}

	const { post }: Props = $props();
</script>

<a href="/blog/{post.slug}" class="blog-card" use:spotlight>
	<img src={post.image} alt={post.title} class="blog-card__image" loading="lazy" />
	<div class="blog-card__body">
		<div class="blog-card__meta">
			<time datetime={post.date}>{formatDate(post.date)}</time>
			<span>&middot;</span>
			<span>{post.readingMinutes} min read</span>
		</div>
		<h3 class="blog-card__title">{post.title}</h3>
		<p class="blog-card__excerpt">{post.excerpt}</p>
		{#if post.tags.length}
			<div class="blog-card__tags">
				{#each post.tags as tag}
					<span class="blog-card__tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</div>
</a>

<style>
	.blog-card {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-2xl);
		overflow: hidden;
		transition:
			transform 250ms var(--ease-spring),
			box-shadow var(--transition-base),
			border-color var(--transition-base);
	}

	.blog-card::before {
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

	.blog-card:hover::before {
		opacity: 1;
	}

	.blog-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		border-color: var(--color-border);
	}

	.blog-card:active {
		transform: scale(0.98);
		transition: transform var(--transition-fast);
	}

	.blog-card:focus-visible {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		border-color: var(--color-border);
	}

	.blog-card__image {
		width: 100%;
		flex: 1 1 0;
		min-height: 0;
		object-fit: cover;
	}

	.blog-card__body {
		padding: 1.25rem;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.blog-card__meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
		flex-shrink: 0;
	}

	.blog-card__title {
		font-family: var(--font-body);
		font-size: var(--text-2xl);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-text);
		margin-bottom: 0.75rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.blog-card__excerpt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.blog-card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: auto;
		overflow: hidden;
	}

	.blog-card__tag {
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
</style>
