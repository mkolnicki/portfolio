<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ShowcaseSection from '$lib/components/ShowcaseSection.svelte';
	import { getDemoComponent } from '$lib/registry/demoRegistry';

	let { data } = $props();

	interface ShowcaseItem {
		slug: string;
		title: string;
		excerpt: string;
		tags: string[];
		href: string;
		linkLabel: string;
		Demo: ReturnType<typeof getDemoComponent>;
	}

	const allShowcaseItems = $derived.by(() => {
		const items: ShowcaseItem[] = [];

		for (const p of data.featuredProjects) {
			if (!p) continue;
			const Demo = getDemoComponent(p.slug);
			if (!Demo) continue;
			items.push({
				slug: p.slug,
				title: p.title,
				excerpt: p.excerpt,
				tags: p.tags,
				href: `/projects/${p.slug}`,
				linkLabel: 'View project',
				Demo
			});
		}

		for (const p of data.featuredPosts) {
			if (!p) continue;
			const Demo = getDemoComponent(p.slug);
			if (!Demo) continue;
			items.push({
				slug: p.slug,
				title: p.title,
				excerpt: p.excerpt,
				tags: p.tags,
				href: `/blog/${p.slug}`,
				linkLabel: 'Read post',
				Demo
			});
		}

		return items;
	});
</script>

<Seo />
<Hero />

{#if allShowcaseItems.length}
	{#each allShowcaseItems as item, i (item.slug)}
		<ShowcaseSection
			id={item.slug}
			title={item.title}
			excerpt={item.excerpt}
			tags={item.tags}
			href={item.href}
			linkLabel={item.linkLabel}
		>
			{#snippet demo(active)}
				<item.Demo {active} />
			{/snippet}
		</ShowcaseSection>
	{/each}
{/if}