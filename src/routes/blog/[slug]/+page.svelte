<script lang="ts">
	import ContentDetail from '$lib/components/ContentDetail.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';

	let { data } = $props();
</script>

<ContentDetail
	meta={data.meta}
	ContentComponent={data.component}
	backHref="/blog"
	backLabel="Back to Writing"
	routePrefix="/blog/"
	navLabel="Post navigation"
	prev={data.prevPost}
	next={data.nextPost}
	related={data.related}
	relatedTitle="Related Articles"
>
	{#snippet relatedCard(post, i)}
		<BlogCard {post} delay={i * 100} />
	{/snippet}
</ContentDetail>
