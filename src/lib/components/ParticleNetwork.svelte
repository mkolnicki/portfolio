<script lang="ts">
	import { browser } from '$app/environment';

	type InteractionMode = 'attract' | 'repel' | 'spawn';

	interface Props {
		active?: boolean;
		initialMode?: InteractionMode;
		initialParticleCount?: number;
		hideControls?: boolean;
	}

	const {
		active = true,
		initialMode = 'attract',
		initialParticleCount = 96,
		hideControls = false
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let wrapper: HTMLDivElement;
	let controlsOpen = $state(false);
	let animating = $state(true);

	// svelte-ignore state_referenced_locally
	let particleCount = $state(initialParticleCount);
	let connectionDist = $state(150);
	let attractionStrength = $state(0.08);
	let speedMultiplier = $state(1);
	// svelte-ignore state_referenced_locally
	let mode: InteractionMode = $state(initialMode);

	let mouseNormX = 0.5;
	let mouseNormY = 0.5;
	let virtualCursorActive = false;
	let virtualNormX = 0.5;
	let virtualNormY = 0.5;
	let frameCount = 0;
	let canvasW = 600;
	let canvasH = 400;
	let nextId = 0;

	interface Particle {
		id: number;
		baseX: number;
		baseY: number;
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		phase: number;
	}

	let particles: Particle[] = [];

	const OPACITY_BINS = 20;

	function buildParticles(count: number, w: number, h: number): Particle[] {
		const cols = Math.round(Math.sqrt((count * w) / h));
		const rows = Math.round(count / cols);
		const p: Particle[] = [];
		nextId = 0;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (p.length >= count) break;
				const baseX = ((col + 0.5) / cols) * w;
				const baseY = ((row + 0.5) / rows) * h;
				p.push({
					id: nextId++,
					baseX,
					baseY,
					x: baseX,
					y: baseY,
					vx: 0,
					vy: 0,
					size: 2 + Math.random() * 2,
					phase: Math.random() * Math.PI * 2
				});
			}
		}
		return p;
	}

	function hexToRgb(hex: string): [number, number, number] {
		hex = hex.replace('#', '');
		if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		return [
			parseInt(hex.slice(0, 2), 16),
			parseInt(hex.slice(2, 4), 16),
			parseInt(hex.slice(4, 6), 16)
		];
	}

	$effect(() => {
		if (!browser || !canvas || !wrapper) return;

		const count = particleCount;

		const style = getComputedStyle(wrapper);
		const accent = style.getPropertyValue('--color-accent').trim() || '#01796F';
		const [cr, cg, cb] = hexToRgb(accent);

		const dpr = window.devicePixelRatio || 1;
		const ctx = canvas.getContext('2d')!;

		function resize() {
			const rect = wrapper.getBoundingClientRect();
			canvasW = rect.width;
			canvasH = rect.height;
			canvas.width = canvasW * dpr;
			canvas.height = canvasH * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			particles = buildParticles(count, canvasW, canvasH);
		}

		resize();

		const ro = new ResizeObserver(resize);
		ro.observe(wrapper);

		// Pre-allocate flat connection bins: each stores [x1, y1, x2, y2, ...]
		const bins: number[][] = Array.from({ length: OPACITY_BINS }, () => []);
		let alive = true;

		function tick() {
			if (!alive) return;

			if (!animating || !active) {
				requestAnimationFrame(tick);
				return;
			}

			frameCount++;
			const currentSpeed = speedMultiplier;
			const t = frameCount * 0.02 * currentSpeed;
			const mx = (virtualCursorActive ? virtualNormX : mouseNormX) * canvasW;
			const my = (virtualCursorActive ? virtualNormY : mouseNormY) * canvasH;
			const DAMPING = 0.96;
			const influenceRadiusSq = 40000; // 200 * 200
			const currentMode = mode;
			const currentAttr = attractionStrength;
			const dist = connectionDist;

			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				const driftFx = Math.cos(t + p.phase) * 0.3 * currentSpeed;
				const driftFy = -Math.sin(t * 0.7 + p.phase) * 0.3 * currentSpeed;

				const dx = mx - p.x;
				const dy = my - p.y;
				const dSq = dx * dx + dy * dy;
				const influence = dSq < influenceRadiusSq ? Math.max(0, 1 - Math.sqrt(dSq) / 200) : 0;
				const dir = currentMode === 'repel' ? -1 : 1;

				p.vx =
					(p.vx +
						driftFx +
						dx * influence * currentAttr * dir +
						(p.baseX - p.x) * 0.005) *
					DAMPING;
				p.vy =
					(p.vy +
						driftFy +
						dy * influence * currentAttr * dir +
						(p.baseY - p.y) * 0.005) *
					DAMPING;
				p.x += p.vx;
				p.y += p.vy;
			}

			ctx.clearRect(0, 0, canvasW, canvasH);

			// Spatial hash for connection lookups
			const cellSize = dist;
			const grid = new Map<number, number[]>();
			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				const key = ((p.x / cellSize) | 0) * 100000 + ((p.y / cellSize) | 0);
				const cell = grid.get(key);
				if (cell) cell.push(i);
				else grid.set(key, [i]);
			}

			for (let i = 0; i < OPACITY_BINS; i++) bins[i].length = 0;

			const distSq = dist * dist;
			const cursorRadiusSq = 62500; // 250 * 250

			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				const cx = (p.x / cellSize) | 0;
				const cy = (p.y / cellSize) | 0;

				for (let ddx = -1; ddx <= 1; ddx++) {
					for (let ddy = -1; ddy <= 1; ddy++) {
						const key = (cx + ddx) * 100000 + (cy + ddy);
						const cell = grid.get(key);
						if (!cell) continue;

						for (const j of cell) {
							if (j <= i) continue;
							const q = particles[j];
							const ldx = p.x - q.x;
							const ldy = p.y - q.y;
							const d2 = ldx * ldx + ldy * ldy;
							if (d2 >= distSq) continue;

							const d = Math.sqrt(d2);
							const rawOpacity = 1 - d / dist;
							if (rawOpacity < 0.05) continue;

							const midX = (p.x + q.x) * 0.5;
							const midY = (p.y + q.y) * 0.5;
							const cdx = midX - mx;
							const cdy = midY - my;
							const cd2 = cdx * cdx + cdy * cdy;
							const cursorBoost =
								cd2 < cursorRadiusSq ? (1 - Math.sqrt(cd2) / 250) * 0.4 : 0;
							const opacity = rawOpacity * (0.4 + cursorBoost);

							const bin = Math.min(OPACITY_BINS - 1, (opacity * OPACITY_BINS) | 0);
							bins[bin].push(p.x, p.y, q.x, q.y);
						}
					}
				}
			}

			// Draw connections batched by opacity bin
			ctx.lineWidth = 1;
			for (let b = 0; b < OPACITY_BINS; b++) {
				const data = bins[b];
				if (data.length === 0) continue;
				ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(b + 0.5) / OPACITY_BINS})`;
				ctx.beginPath();
				for (let k = 0; k < data.length; k += 4) {
					ctx.moveTo(data[k], data[k + 1]);
					ctx.lineTo(data[k + 2], data[k + 3]);
				}
				ctx.stroke();
			}

			// Draw particles in two opacity passes
			ctx.fillStyle = `rgba(${cr},${cg},${cb},0.5)`;
			ctx.beginPath();
			for (let i = 0; i < particles.length; i += 3) {
				const p = particles[i];
				const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
				const sz = p.size + Math.min(speed * 0.3, 2);
				ctx.moveTo(p.x + sz, p.y);
				ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
			}
			ctx.fill();

			ctx.fillStyle = `rgba(${cr},${cg},${cb},0.7)`;
			ctx.beginPath();
			for (let i = 0; i < particles.length; i++) {
				if (i % 3 === 0) continue;
				const p = particles[i];
				const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
				const sz = p.size + Math.min(speed * 0.3, 2);
				ctx.moveTo(p.x + sz, p.y);
				ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
			}
			ctx.fill();

			requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);

		return () => {
			alive = false;
			ro.disconnect();
		};
	});

	function getMousePos(e: MouseEvent | Touch) {
		const rect = wrapper?.getBoundingClientRect();
		if (!rect) return;
		mouseNormX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		mouseNormY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
		virtualCursorActive = false;
	}

	function handleMouseMove(e: MouseEvent) {
		getMousePos(e);
	}

	function handleMouseLeave() {
		mouseNormX = 0.5;
		mouseNormY = 0.5;
		virtualCursorActive = false;
	}

	function handleClick(e: MouseEvent) {
		if (mode !== 'spawn') return;
		const rect = wrapper?.getBoundingClientRect();
		if (!rect) return;
		if (particles.length >= 250) return;
		const cx = ((e.clientX - rect.left) / rect.width) * canvasW;
		const cy = ((e.clientY - rect.top) / rect.height) * canvasH;
		particles.push({
			id: nextId++,
			baseX: cx,
			baseY: cy,
			x: cx,
			y: cy,
			vx: (Math.random() - 0.5) * 6,
			vy: (Math.random() - 0.5) * 6,
			size: 2 + Math.random() * 2,
			phase: Math.random() * Math.PI * 2
		});
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length > 0) getMousePos(e.touches[0]);
	}

	function handleTouchMove(e: TouchEvent) {
		e.preventDefault();
		if (e.touches.length > 0) getMousePos(e.touches[0]);
	}

	function handleTouchEnd() {
		mouseNormX = 0.5;
		mouseNormY = 0.5;
	}

	function handleKeyDown(e: KeyboardEvent) {
		const step = 0.03;
		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				virtualCursorActive = true;
				virtualNormX = Math.max(0, virtualNormX - step);
				break;
			case 'ArrowRight':
				e.preventDefault();
				virtualCursorActive = true;
				virtualNormX = Math.min(1, virtualNormX + step);
				break;
			case 'ArrowUp':
				e.preventDefault();
				virtualCursorActive = true;
				virtualNormY = Math.max(0, virtualNormY - step);
				break;
			case 'ArrowDown':
				e.preventDefault();
				virtualCursorActive = true;
				virtualNormY = Math.min(1, virtualNormY + step);
				break;
			case ' ':
				e.preventDefault();
				animating = !animating;
				break;
			case 'm':
			case 'M': {
				const modes: InteractionMode[] = ['attract', 'repel', 'spawn'];
				const idx = modes.indexOf(mode);
				mode = modes[(idx + 1) % modes.length];
				break;
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
	class="particle-wrap"
	bind:this={wrapper}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
	onclick={handleClick}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	onkeydown={handleKeyDown}
	tabindex="0"
	role="application"
	aria-label="Interactive particle network animation. Use arrow keys to move cursor, Space to pause, M to change mode."
>
	<canvas bind:this={canvas}></canvas>

	{#if !hideControls}
		<div class="controls-area">
			<button class="toggle-btn" onclick={() => (animating = !animating)}>
				{animating ? 'Pause' : 'Play'}
			</button>
			<button class="toggle-btn" onclick={() => (controlsOpen = !controlsOpen)}>
				{controlsOpen ? 'Hide' : 'Controls'}
			</button>
		</div>

		<div class="controls-panel" class:open={controlsOpen}>
			<div class="control-group">
				<span class="control-label">
					Mode
					<span class="control-value">{mode}</span>
				</span>
				<div class="mode-buttons">
					<button
						class="mode-btn"
						class:active={mode === 'attract'}
						onclick={() => (mode = 'attract')}
					>
						Attract
					</button>
					<button
						class="mode-btn"
						class:active={mode === 'repel'}
						onclick={() => (mode = 'repel')}
					>
						Repel
					</button>
					<button
						class="mode-btn"
						class:active={mode === 'spawn'}
						onclick={() => (mode = 'spawn')}
					>
						Spawn
					</button>
				</div>
			</div>

			<label class="control-group">
				<span class="control-label">
					Particles
					<span class="control-value">{particleCount}</span>
				</span>
				<input type="range" min="24" max="100" step="1" bind:value={particleCount} />
			</label>

			<label class="control-group">
				<span class="control-label">
					Connect Distance
					<span class="control-value">{connectionDist}</span>
				</span>
				<input type="range" min="50" max="100" step="10" bind:value={connectionDist} />
			</label>

			<label class="control-group">
				<span class="control-label">
					Attraction
					<span class="control-value">{attractionStrength.toFixed(2)}</span>
				</span>
				<input
					type="range"
					min="0.01"
					max="0.2"
					step="0.01"
					bind:value={attractionStrength}
				/>
			</label>

			<label class="control-group">
				<span class="control-label">
					Speed
					<span class="control-value">{speedMultiplier.toFixed(1)}x</span>
				</span>
				<input type="range" min="0.2" max="3" step="0.1" bind:value={speedMultiplier} />
			</label>
		</div>
	{/if}
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
		touch-action: none;
	}

	.particle-wrap:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.controls-area {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		display: flex;
		gap: 0.4rem;
	}

	.toggle-btn {
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-family: var(--font-mono);
		background: var(--color-surface);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.toggle-btn:hover {
		color: var(--color-text);
		border-color: var(--color-border);
	}

	.controls-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--color-surface);
		border-top: 1px solid var(--color-border-subtle);
		padding: 0;
		max-height: 0;
		overflow: hidden;
		transition:
			max-height 0.3s ease,
			padding 0.3s ease;
	}

	.controls-panel.open {
		max-height: 300px;
		padding: 0.75rem 1rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.control-group:last-child {
		margin-bottom: 0;
	}

	.control-label {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		font-family: var(--font-mono);
		color: var(--color-text-muted);
	}

	.control-value {
		color: var(--color-text);
	}

	.mode-buttons {
		display: flex;
		gap: 0.3rem;
	}

	.mode-btn {
		flex: 1;
		padding: 0.2rem 0.4rem;
		font-size: 0.65rem;
		font-family: var(--font-mono);
		background: var(--color-bg-subtle);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast),
			background var(--transition-fast);
	}

	.mode-btn:hover {
		color: var(--color-text);
		border-color: var(--color-border);
	}

	.mode-btn.active {
		color: var(--color-accent);
		border-color: var(--color-accent);
		background: var(--color-bg-subtle);
	}

	input[type='range'] {
		width: 100%;
		height: 4px;
		appearance: none;
		background: var(--color-border-subtle);
		border-radius: 2px;
		outline: none;
		cursor: pointer;
	}

	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
	}

	input[type='range']::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-accent);
		border: none;
		cursor: pointer;
	}
</style>
