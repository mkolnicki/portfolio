<script lang="ts">
	import { browser } from '$app/environment';
	import Seo from '$lib/components/Seo.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ShowcaseSection from '$lib/components/ShowcaseSection.svelte';
	import SectionNav from '$lib/components/SectionNav.svelte';
	import { getDemoComponent } from '$lib/registry/demoRegistry';

	let { data } = $props();

	let activeId = $state<string | null>(null);

	const navGroups = $derived.by(() => {
		const groups: { label: string; items: { id: string; title: string }[] }[] = [];

		const projectItems = data.featuredProjects
			.filter((p): p is NonNullable<typeof p> => p != null && !!getDemoComponent(p.slug))
			.map((p) => ({ id: p.slug, title: p.title }));
		if (projectItems.length) groups.push({ label: 'Projects', items: projectItems });

		const postItems = data.featuredPosts
			.filter((p): p is NonNullable<typeof p> => p != null && !!getDemoComponent(p.slug))
			.map((p) => ({ id: p.slug, title: p.title }));
		if (postItems.length) groups.push({ label: 'Writing', items: postItems });

		return groups;
	});

	const allItemIds = $derived(navGroups.flatMap((g) => g.items.map((i) => i.id)));

	$effect(() => {
		if (!browser || !allItemIds.length) return;

		let ticking = false;

		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				const trigger = window.innerHeight * 0.3;
				let current: string | null = null;

				for (const id of allItemIds) {
					const el = document.getElementById(id);
					if (!el) continue;
					const rect = el.getBoundingClientRect();
					if (rect.top <= trigger && rect.bottom > trigger) {
						current = id;
					}
				}

				activeId = current;
				ticking = false;
			});
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<Seo />
<Hero />

{#if navGroups.length}
	<SectionNav groups={navGroups} {activeId} visible={activeId !== null} />
{/if}

{#if data.featuredProjects.length}
	<section class="showcase-group">
		{#each data.featuredProjects as project (project.slug)}
			{@const Demo = getDemoComponent(project.slug)}
			{#if Demo}
				<ShowcaseSection
					id={project.slug}
					title={project.title}
					excerpt={project.excerpt}
					tags={project.tags}
					href="/projects/{project.slug}"
					linkLabel="View project"
				>
					{#snippet demo(active)}
						<Demo {active} />
					{/snippet}
				</ShowcaseSection>
			{/if}
		{/each}
	</section>
{/if}

{#if data.featuredPosts.length}
	<section class="showcase-group">
		{#each data.featuredPosts as post (post.slug)}
			{@const Demo = getDemoComponent(post.slug)}
			{#if Demo}
				<ShowcaseSection
					id={post.slug}
					title={post.title}
					excerpt={post.excerpt}
					tags={post.tags}
					href="/blog/{post.slug}"
					linkLabel="Read post"
				>
					{#snippet demo(active)}
						<Demo {active} />
					{/snippet}
				</ShowcaseSection>
			{/if}
		{/each}
	</section>
{/if}
