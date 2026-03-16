<script lang="ts">
	import { browser } from '$app/environment';
	import { reveal } from '$lib/actions/reveal';

	interface Props {
		count: number;
	}

	const { count }: Props = $props();

	let container: HTMLDivElement | undefined = $state();
	let frame = 0;

	const COLS = 20;
	const ROWS = 10;
	const width = 1000;
	const height = 500;

	interface Node {
		id: number;
		baseX: number;
		baseY: number;
		x: number;
		y: number;
		phase: number;
		size: number;
	}

	let nodes = $state<Node[]>([]);

	function initNodes() {
		const n: Node[] = [];
		let id = 0;
		for (let row = 0; row < ROWS; row++) {
			for (let col = 0; col < COLS; col++) {
				const offsetX = row % 2 === 0 ? 0 : (width / COLS) * 0.5;
				const baseX = ((col + 0.5) / COLS) * width + offsetX;
				const baseY = ((row + 0.5) / ROWS) * height;
				n.push({
					id: id++,
					baseX,
					baseY,
					x: baseX,
					y: baseY,
					phase: Math.random() * Math.PI * 2,
					size: 1.2 + Math.random() * 0.8
				});
			}
		}
		nodes = n;
	}

	$effect(() => {
		if (!browser) return;
		initNodes();
	});

	$effect(() => {
		if (!browser || !nodes.length) return;

		let raf: number;
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return;

		function tick() {
			frame++;
			const t = frame * 0.008;

			for (const n of nodes) {
				const wave = Math.sin(t + n.baseX * 0.005 + n.baseY * 0.003) * 6;
				const drift = Math.cos(t * 0.5 + n.phase) * 3;
				n.x = n.baseX + drift;
				n.y = n.baseY + wave;
			}

			raf = requestAnimationFrame(tick);
		}

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const CONNECTION_DIST = 70;

	let connections = $derived.by(() => {
		const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const a = nodes[i];
				const b = nodes[j];
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < CONNECTION_DIST) {
					lines.push({
						x1: a.x,
						y1: a.y,
						x2: b.x,
						y2: b.y,
						opacity: Math.pow(1 - dist / CONNECTION_DIST, 1.5)
					});
				}
			}
		}
		return lines;
	});
</script>

<section class="projects-hero">
	<div class="projects-hero__bg" bind:this={container} role="presentation">
		<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
			{#each connections as line, i (i)}
				<line
					x1={line.x1}
					y1={line.y1}
					x2={line.x2}
					y2={line.y2}
					stroke="var(--color-accent)"
					stroke-width="0.5"
					opacity={line.opacity * 0.2}
				/>
			{/each}
			{#each nodes as n (n.id)}
				<circle cx={n.x} cy={n.y} r={n.size} fill="var(--color-accent)" opacity="0.25" />
			{/each}
		</svg>
	</div>
	<div class="projects-hero__gradient"></div>
	<div class="projects-hero__inner container">
		<span class="projects-hero__label" use:reveal={{ delay: 0, distance: '20px', duration: 700 }}>Work</span>
		<h1 class="projects-hero__title" use:reveal={{ delay: 120, distance: '40px', duration: 900 }}>Projects</h1>
		<p class="projects-hero__subtitle" use:reveal={{ delay: 250, distance: '16px', duration: 700 }}>
			Things I've built.
			<span class="projects-hero__count">{count} project{count !== 1 ? 's' : ''}</span>
		</p>
	</div>
</section>

<style>
	.projects-hero {
		position: relative;
		min-height: 40vh;
		display: flex;
		align-items: flex-end;
		padding-bottom: 4rem;
		overflow: hidden;
	}

	.projects-hero__bg {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
		pointer-events: none;
	}

	.projects-hero__bg svg {
		width: 100%;
		height: 100%;
		opacity: 0.7;
		mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 10%, transparent 70%);
		-webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 10%, transparent 70%);
	}

	.projects-hero__gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, var(--color-bg) 0%, transparent 50%);
		z-index: 1;
		pointer-events: none;
	}

	.projects-hero__inner {
		position: relative;
		z-index: 2;
		width: 100%;
	}

	.projects-hero__label {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--color-accent);
		margin-bottom: 0.75rem;
	}

	.projects-hero__title {
		font-family: var(--font-body);
		font-size: var(--text-5xl);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
		line-height: 1.1;
		margin-bottom: 1rem;
	}

	.projects-hero__subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		line-height: 1.5;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.projects-hero__count {
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
		.projects-hero {
			min-height: 30vh;
			padding-bottom: 3rem;
		}
	}
</style>
