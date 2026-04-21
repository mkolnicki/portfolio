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

	// Committed-transition carousel: scroll position is never modified.
	// Scroll only determines which section is "committed" (an integer).
	// Visuals are driven entirely by a lerp toward the committed state.
	$effect(() => {
		if (!browser || !stackEl || isMobile || sectionCount === 0) return;

		let current: number[] = new Array(sectionCount).fill(0);
		let committedSection = 0;
		let inShowcase = false;
		let rafId: number | null = null;
		let animating = false;

		function getTargets(): number[] {
			return Array.from({ length: sectionCount }, (_, i) => (i < committedSection ? 1 : 0));
		}

		function tick() {
			const targets = getTargets();
			const ease = 0.05;
			let settled = true;

			for (let i = 0; i < sectionCount; i++) {
				const diff = targets[i] - current[i];
				if (Math.abs(diff) > 0.0005) {
					current[i] += diff * ease;
					settled = false;
				} else {
					current[i] = targets[i];
				}
			}

			sectionProgress = [...current];
			activeId = inShowcase ? allShowcaseItems[committedSection]?.slug ?? null : null;

			if (!settled) {
				rafId = requestAnimationFrame(tick);
			} else {
				animating = false;
			}
		}

		function startLerp() {
			if (!animating) {
				animating = true;
				rafId = requestAnimationFrame(tick);
			}
		}

		function onScroll() {
			if (!stackEl) return;
			const viewportH = window.innerHeight;
			const stackTop = stackEl.offsetTop;
			const scrolled = window.scrollY - stackTop;

			if (scrolled < 0) {
				inShowcase = false;
				if (committedSection !== 0) {
					committedSection = 0;
					startLerp();
				} else if (activeId !== null) {
					activeId = null;
				}
				return;
			}

			inShowcase = true;

			if (scrolled >= sectionCount * viewportH) {
				const last = sectionCount - 1;
				if (committedSection !== last) {
					committedSection = last;
					startLerp();
				}
				return;
			}

			const rawIndex = scrolled / viewportH;
			// Commit forward at 30% into the scroll range, backward at 70%
			const fraction = rawIndex - Math.floor(rawIndex);
			const base = Math.floor(rawIndex);
			const newCommitted = Math.max(
				0,
				Math.min(sectionCount - 1, fraction >= 0.3 ? base + 1 : base)
			);

			if (newCommitted !== committedSection) {
				committedSection = newCommitted;
				startLerp();
			}
		}

		window.addEventListener('scroll', onScroll, { passive: true });

		// Initialize without animation
		if (stackEl) {
			const scrolled = window.scrollY - stackEl.offsetTop;
			inShowcase = scrolled >= 0;
			if (scrolled >= 0 && scrolled < sectionCount * window.innerHeight) {
				committedSection = Math.max(
					0,
					Math.min(sectionCount - 1, Math.round(scrolled / window.innerHeight))
				);
			}
		}
		current = [...getTargets()];
		sectionProgress = [...current];
		activeId = inShowcase ? allShowcaseItems[committedSection]?.slug ?? null : null;

		return () => {
			window.removeEventListener('scroll', onScroll);
			if (rafId !== null) cancelAnimationFrame(rafId);
		};
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
			style:height="{(sectionCount + 1) * 100}vh"
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
