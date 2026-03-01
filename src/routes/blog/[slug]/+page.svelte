<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
	const fullDate = new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	type PortableTextSpan = {
		_type: 'span';
		text?: string;
	};

	type PortableTextBlock = {
		_type: 'block';
		style?: string;
		children?: PortableTextSpan[];
	};

	function isPortableTextBlock(value: unknown): value is PortableTextBlock {
		return (
			typeof value === 'object' &&
			value !== null &&
			'_type' in value &&
			value._type === 'block'
		);
	}

	function blockText(block: PortableTextBlock): string {
		return (
			block.children
				?.filter((child) => child?._type === 'span')
				.map((child) => child.text ?? '')
				.join('') ?? ''
		);
	}

	let blocks = $derived(
		(Array.isArray(data.post.body) ? data.post.body : [])
			.filter(isPortableTextBlock)
			.map((block) => ({ ...block, text: blockText(block) }))
			.filter((block) => block.text.trim().length > 0)
	);
</script>

<main class="container blog-post-page">
	<article class="post">
		<p class="back-link font-sans text-small"><a href={resolve('/blog')}>← Back to Engineering Notes</a></p>
		<p class="kicker uppercase font-sans text-small">Engineering Breakdown</p>
		<h1>{data.post.title}</h1>
		<p class="post-meta font-sans text-small text-muted">
			{fullDate.format(new Date(data.post.publishedAt))}
			{#if data.post.readingMinutes}
				· {data.post.readingMinutes} min read
			{/if}
		</p>
		<p class="deck text-muted">{data.post.excerpt}</p>

		<div class="post-body hairline-top">
			{#each blocks as block, index (`${index}-${block.text.slice(0, 20)}`)}
				{#if block.style === 'h1' || block.style === 'h2'}
					<h2>{block.text}</h2>
				{:else if block.style === 'h3'}
					<h3>{block.text}</h3>
				{:else if block.style === 'h4'}
					<h4>{block.text}</h4>
				{:else if block.style === 'blockquote'}
					<blockquote>{block.text}</blockquote>
				{:else}
					<p>{block.text}</p>
				{/if}
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

	.post-body h2,
	.post-body h3,
	.post-body h4 {
		margin-top: var(--spacing-md);
		margin-bottom: var(--spacing-sm);
	}

	.post-body h2 {
		font-size: clamp(1.5rem, 3vw, 2rem);
	}

	.post-body h3 {
		font-size: clamp(1.25rem, 2.2vw, 1.65rem);
	}

	.post-body h4 {
		font-size: clamp(1.1rem, 1.8vw, 1.3rem);
		font-family: var(--font-sans);
	}

	.post-body blockquote {
		margin: 0 0 var(--spacing-md);
		padding-left: var(--spacing-sm);
		border-left: 2px solid var(--color-hairline);
		color: var(--color-muted);
		font-style: italic;
	}
</style>
