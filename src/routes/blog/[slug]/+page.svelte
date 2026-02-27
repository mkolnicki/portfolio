<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
	const fullDate = new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
	let paragraphs = $derived(
		data.post.bodyText
			.split('\n')
			.map((line: string) => line.trim())
			.filter(Boolean)
	);
</script>

<main class="container blog-post-page">
	<article class="post">
		<p class="back-link font-sans text-small"><a href={resolve('/blog')}>← Back to Blog</a></p>
		<p class="kicker uppercase font-sans text-small">Field Report</p>
		<h1>{data.post.title}</h1>
		<p class="post-meta font-sans text-small text-muted">
			{fullDate.format(new Date(data.post.publishedAt))}
			{#if data.post.readingMinutes}
				· {data.post.readingMinutes} min read
			{/if}
		</p>
		<p class="deck text-muted">{data.post.excerpt}</p>

		<div class="post-body hairline-top">
			{#each paragraphs as paragraph, index (`${index}-${paragraph.slice(0, 20)}`)}
				<p>{paragraph}</p>
			{/each}
		</div>
	</article>
</main>

<style>
	.blog-post-page {
		margin-bottom: var(--spacing-xl);
	}

	.post {
		max-width: 860px;
	}

	.kicker {
		margin-bottom: var(--spacing-xs);
	}

	.back-link {
		margin-bottom: var(--spacing-sm);
	}

	h1 {
		font-size: clamp(2.1rem, 5vw, 3.4rem);
		margin-bottom: var(--spacing-xs);
	}

	.post-meta {
		margin-bottom: var(--spacing-sm);
	}

	.deck {
		font-size: 1.15rem;
		margin-bottom: var(--spacing-md);
		max-width: 72ch;
	}

	.post-body {
		padding-top: var(--spacing-md);
		column-count: 1;
		text-align: justify;
		hyphens: auto;
	}

	.post-body p {
		margin-bottom: var(--spacing-md);
	}
</style>
