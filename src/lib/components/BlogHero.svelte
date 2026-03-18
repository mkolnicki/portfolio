<script lang="ts">
	import { browser } from '$app/environment';
	import { reveal } from '$lib/actions/reveal';

	interface Props {
		count: number;
	}

	const { count }: Props = $props();

	let frame = 0;
	const width = 1200;
	const height = 400;
	const LINE_COUNT = 8;

	let paths = $state<string[]>([]);

	function buildPaths(t: number): string[] {
		const result: string[] = [];
		for (let i = 0; i < LINE_COUNT; i++) {
			const yBase = (height / (LINE_COUNT + 1)) * (i + 1);
			const amplitude = 15 + i * 3;
			const frequency = 0.003 + i * 0.0005;
			const phaseOffset = i * 0.8;
			const points: string[] = [];

			for (let x = 0; x <= width; x += 4) {
				const y =
					yBase +
					Math.sin(x * frequency + t + phaseOffset) * amplitude +
					Math.sin(x * frequency * 2.3 + t * 0.7 + phaseOffset) * (amplitude * 0.3);
				points.push(`${x},${y.toFixed(1)}`);
			}

			result.push('M' + points.join(' L'));
		}
		return result;
	}

	$effect(() => {
		if (!browser) return;
		paths = buildPaths(0);
	});

	let heroEl: HTMLElement | undefined = $state();
	let isVisible = $state(true);

	$effect(() => {
		if (!browser || !heroEl) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				isVisible = entry.isIntersecting;
			},
			{ threshold: 0 }
		);
		observer.observe(heroEl);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!browser || !paths.length) return;

		let raf: number;
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return;

		function tick() {
			if (isVisible) {
				frame++;
				paths = buildPaths(frame * 0.012);
			}
			raf = requestAnimationFrame(tick);
		}

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});
</script>

<section class="blog-hero" bind:this={heroEl}>
	<div class="blog-hero__bg" role="presentation">
		<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
			{#each paths as d, i (i)}
				<path
					{d}
					fill="none"
					stroke="var(--color-accent)"
					stroke-width={0.6 + (i % 3) * 0.2}
					opacity={0.08 + (i / LINE_COUNT) * 0.08}
				/>
			{/each}
		</svg>
	</div>
	<div class="blog-hero__gradient"></div>
	<div class="blog-hero__inner container">
		<span class="blog-hero__label" use:reveal={{ delay: 0, distance: '20px', duration: 700 }}>Journal</span>
		<h1 class="blog-hero__title" use:reveal={{ delay: 120, distance: '40px', duration: 900 }}>Writing</h1>
		<p class="blog-hero__subtitle" use:reveal={{ delay: 250, distance: '16px', duration: 700 }}>
			On AI, web development, and things I'm building.
			<span class="blog-hero__count">{count} article{count !== 1 ? 's' : ''}</span>
		</p>
	</div>
</section>

<style>
	.blog-hero {
		position: relative;
		min-height: 40vh;
		display: flex;
		align-items: flex-end;
		padding-bottom: 4rem;
		overflow: hidden;
	}

	.blog-hero__bg {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
		pointer-events: none;
	}

	.blog-hero__bg svg {
		width: 100%;
		height: 100%;
		opacity: 0.8;
		mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 10%, transparent 65%);
		-webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 10%, transparent 65%);
	}

	.blog-hero__gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, var(--color-bg) 0%, transparent 50%);
		z-index: 1;
		pointer-events: none;
	}

	.blog-hero__inner {
		position: relative;
		z-index: 2;
		width: 100%;
	}

	.blog-hero__label {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--color-accent);
		margin-bottom: 0.75rem;
	}

	.blog-hero__title {
		font-family: var(--font-body);
		font-size: var(--text-5xl);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
		line-height: 1.1;
		margin-bottom: 1rem;
	}

	.blog-hero__subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		line-height: 1.5;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
	}

	.blog-hero__count {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
		border: 1px solid var(--color-border);
		padding: 0.2rem 0.6rem;
		border-radius: var(--radius-sm);
	}

	@media (max-width: 768px) {
		.blog-hero {
			min-height: 30vh;
			padding-top: 6rem;
			padding-bottom: 3rem;
		}
	}
</style>
