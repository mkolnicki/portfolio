<script lang="ts">
	import { browser } from '$app/environment';
	import Seo from '$lib/components/Seo.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ShowcaseSection from '$lib/components/ShowcaseSection.svelte';
	import SectionNav from '$lib/components/SectionNav.svelte';
	import { getDemoComponent } from '$lib/registry/demoRegistry';

	let { data } = $props();

	let activeId = $state<string | null>(null);
	let stackEl: HTMLDivElement | undefined = $state();
	let isMobile = $state(false);

	// Combine all showcase items into a single ordered list
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

	const sectionCount = $derived(allShowcaseItems.length);

	// Per-section scroll progress (0 to 1)
	let sectionProgress = $state<number[]>([]);

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

	// Media query for mobile
	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia('(max-width: 768px)');
		isMobile = mq.matches;
		function onChange(e: MediaQueryListEvent) {
			isMobile = e.matches;
		}
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	// Scroll handler for stacked sections
	$effect(() => {
		if (!browser || !stackEl || isMobile || sectionCount === 0) return;

		let ticking = false;

		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				if (!stackEl) {
					ticking = false;
					return;
				}

				const stackRect = stackEl.getBoundingClientRect();
				const viewportH = window.innerHeight;
				// How far the top of the stack has scrolled past the top of the viewport
				const scrolled = -stackRect.top;
				const scrollPerSection = viewportH;
				const totalScroll = sectionCount * scrollPerSection;

				const progresses: number[] = [];
				let currentActiveId: string | null = null;

				for (let i = 0; i < sectionCount; i++) {
					const sectionStart = i * scrollPerSection;
					const raw = (scrolled - sectionStart) / scrollPerSection;
					const clamped = Math.max(0, Math.min(1, raw));
					progresses.push(clamped);

					// Active = currently most visible section
					if (raw >= 0 && raw < 1) {
						currentActiveId = allShowcaseItems[i].slug;
					}
				}

				// If we've scrolled past all sections, last one is active
				if (scrolled >= totalScroll - scrollPerSection && sectionCount > 0) {
					currentActiveId = allShowcaseItems[sectionCount - 1].slug;
				}

				// If we haven't reached the stack yet, nothing active
				if (scrolled < 0) {
					currentActiveId = null;
				}

				sectionProgress = progresses;
				activeId = currentActiveId;
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

{#if allShowcaseItems.length}
	{#if isMobile}
		<!-- Mobile: normal flow -->
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
	{:else}
		<!-- Desktop: stacked scroll -->
		<div
			class="showcase-stack"
			bind:this={stackEl}
			style:height="{sectionCount * 100}vh"
		>
			<div class="showcase-stack__viewport">
				{#each allShowcaseItems as item, i (item.slug)}
					<!-- Invisible anchor for SectionNav scrollIntoView -->
					<div
						id={item.slug}
						class="showcase-stack__anchor"
						style:top="{(i / sectionCount) * 100}%"
					></div>
					<ShowcaseSection
						title={item.title}
						excerpt={item.excerpt}
						tags={item.tags}
						href={item.href}
						linkLabel={item.linkLabel}
						progress={sectionProgress[i] ?? 0}
						prevProgress={i > 0 ? (sectionProgress[i - 1] ?? 0) : 0}
						index={i}
						{sectionCount}
						stacked={true}
					>
						{#snippet demo(active)}
							<item.Demo {active} />
						{/snippet}
					</ShowcaseSection>
				{/each}
			</div>
		</div>
	{/if}
{/if}

<style>
	.showcase-stack {
		position: relative;
	}

	.showcase-stack__viewport {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		overflow: clip;
	}

	.showcase-stack__anchor {
		position: absolute;
		left: 0;
		width: 1px;
		height: 1px;
		pointer-events: none;
	}
</style>
