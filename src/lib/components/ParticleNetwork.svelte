<script lang="ts">
	import { browser } from '$app/environment';

	let canvas: HTMLDivElement;
	let mouseX = $state(0.5);
	let mouseY = $state(0.5);
	let frame = 0;
	let animating = $state(true);

	const COLS = 12;
	const ROWS = 8;
	const CONNECTION_DIST = 150;

	interface Particle {
		id: number;
		baseX: number;
		baseY: number;
		x: number;
		y: number;
		size: number;
		phase: number;
	}

	let particles = $state<Particle[]>([]);
	let width = $state(600);
	let height = $state(400);

	function initParticles() {
		const p: Particle[] = [];
		let id = 0;
		for (let row = 0; row < ROWS; row++) {
			for (let col = 0; col < COLS; col++) {
				const baseX = ((col + 0.5) / COLS) * width;
				const baseY = ((row + 0.5) / ROWS) * height;
				p.push({
					id: id++,
					baseX,
					baseY,
					x: baseX,
					y: baseY,
					size: 2 + Math.random() * 2,
					phase: Math.random() * Math.PI * 2
				});
			}
		}
		particles = p;
	}

	$effect(() => {
		if (!browser) return;
		initParticles();
	});

	$effect(() => {
		if (!browser || !animating) return;

		let raf: number;

		function tick() {
			frame++;
			const t = frame * 0.02;
			const mx = mouseX * width;
			const my = mouseY * height;

			for (const p of particles) {
				const dx = mx - p.baseX;
				const dy = my - p.baseY;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const influence = Math.max(0, 1 - dist / 200);

				const offsetX = Math.sin(t + p.phase) * 8 + dx * influence * 0.08;
				const offsetY = Math.cos(t * 0.7 + p.phase) * 8 + dy * influence * 0.08;

				p.x = p.baseX + offsetX;
				p.y = p.baseY + offsetY;
			}

			raf = requestAnimationFrame(tick);
		}

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	function handleMouseMove(e: MouseEvent) {
		const rect = canvas?.getBoundingClientRect();
		if (!rect) return;
		mouseX = (e.clientX - rect.left) / rect.width;
		mouseY = (e.clientY - rect.top) / rect.height;
	}

	function handleMouseLeave() {
		mouseX = 0.5;
		mouseY = 0.5;
	}

	let connections = $derived.by(() => {
		const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
		for (let i = 0; i < particles.length; i++) {
			for (let j = i + 1; j < particles.length; j++) {
				const a = particles[i];
				const b = particles[j];
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < CONNECTION_DIST) {
					lines.push({
						x1: a.x,
						y1: a.y,
						x2: b.x,
						y2: b.y,
						opacity: 1 - dist / CONNECTION_DIST
					});
				}
			}
		}
		return lines;
	});
</script>

<div
	class="particle-wrap"
	bind:this={canvas}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
	role="img"
	aria-label="Interactive particle network animation"
>
	<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
		{#each connections as line, i (i)}
			<line
				x1={line.x1}
				y1={line.y1}
				x2={line.x2}
				y2={line.y2}
				stroke="var(--color-accent)"
				stroke-width="1"
				opacity={line.opacity * 0.4}
			/>
		{/each}
		{#each particles as p (p.id)}
			<circle cx={p.x} cy={p.y} r={p.size} fill="var(--color-accent)" opacity="0.7" />
		{/each}
	</svg>
	<button class="toggle-btn" onclick={() => (animating = !animating)}>
		{animating ? 'Pause' : 'Play'}
	</button>
</div>

<style>
	.particle-wrap {
		position: relative;
		width: 100%;
		aspect-ratio: 3 / 2;
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
		cursor: crosshair;
		margin-block: 2rem;
	}

	svg {
		width: 100%;
		height: 100%;
	}

	.toggle-btn {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-family: var(--font-mono);
		background: var(--color-surface);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: color var(--transition-fast), border-color var(--transition-fast);
	}

	.toggle-btn:hover {
		color: var(--color-text);
		border-color: var(--color-border);
	}
</style>
