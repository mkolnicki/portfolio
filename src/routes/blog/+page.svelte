<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';

	let { data } = $props();
</script>

<Seo title="Blog" description="Writing about AI, web development, and things I'm building." />

<div class="blog-page container">
	<header class="blog-page__header">
		<h1 class="blog-page__title">Blog</h1>
		<p class="blog-page__desc">Writing about AI, web development, and things I'm building.</p>
	</header>

	{#if data.posts.length}
		<div class="grid">
			{#each data.posts as post}
				<BlogCard {post} />
			{/each}
		</div>
	{:else}
		<p class="blog-page__empty">No posts yet. Check back soon.</p>
	{/if}
</div>

<style>
	.blog-page {
		padding-block: 4rem;
	}

	.blog-page__header {
		margin-bottom: 2.5rem;
	}

	.blog-page__title {
		font-size: var(--text-3xl);
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.blog-page__desc {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
	}

	.grid {
		display: grid;
		gap: 2.5rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
		grid-auto-rows: 26rem;
	}

	.blog-page__empty {
		color: var(--color-text-muted);
	}
</style>
