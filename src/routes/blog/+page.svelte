<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import BlogHero from '$lib/components/BlogHero.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import FeaturedPostCard from '$lib/components/FeaturedPostCard.svelte';
	import TagFilter from '$lib/components/TagFilter.svelte';
	import { reveal } from '$lib/actions/reveal';

	let { data } = $props();

	let activeTag = $state<string | null>(null);

	const allTags = $derived(() => {
		const tagSet = new Set<string>();
		for (const p of data.posts) {
			for (const t of p.tags) tagSet.add(t);
		}
		return [...tagSet].sort();
	});

	const featuredPost = $derived(data.posts.find((p) => p.featured) ?? null);

	const remaining = $derived(() => {
		const rest = data.posts.filter((p) => p !== featuredPost);
		if (!activeTag) return rest;
		return rest.filter((p) => p.tags.includes(activeTag!));
	});

	const featuredVisible = $derived(() => {
		if (!activeTag) return true;
		return featuredPost?.tags.includes(activeTag!) ?? false;
	});
</script>

<Seo title="Writing" description="On AI, web development, and things I'm building." />

<BlogHero count={data.posts.length} />

<div class="blog-page container">
	{#if allTags().length > 1}
		<div class="blog-page__filters" use:reveal={{ delay: 100, distance: '12px' }}>
			<TagFilter tags={allTags()} {activeTag} onchange={(tag) => (activeTag = tag)} />
		</div>
	{/if}

	{#if featuredPost && featuredVisible()}
		<div class="blog-page__featured">
			<FeaturedPostCard post={featuredPost} />
		</div>
	{/if}

	{#if remaining().length}
		<div class="grid">
			{#each remaining() as post, i (post.slug)}
				<BlogCard {post} delay={i * 80} />
			{/each}
		</div>
	{:else if !featuredPost || !featuredVisible()}
		<p class="blog-page__empty">No posts match this filter.</p>
	{/if}
</div>

<style>
	.blog-page {
		padding-bottom: 6rem;
	}

	.blog-page__filters {
		margin-bottom: 2.5rem;
	}

	.blog-page__featured {
		margin-bottom: 3rem;
	}

	.grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: 1.15fr 1fr;
		grid-auto-rows: 26rem;
	}

	/* Offset the right column for editorial rhythm */
	.grid > :global(:nth-child(even)) {
		transform: translateY(2rem);
	}

	.blog-page__empty {
		color: var(--color-text-muted);
		text-align: center;
		padding: 4rem 0;
	}

	@media (max-width: 768px) {
		.grid {
			grid-template-columns: 1fr;
			grid-auto-rows: 24rem;
		}

		.grid > :global(:nth-child(even)) {
			transform: none;
		}
	}
</style>
