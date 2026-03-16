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

	let wrapper: HTMLDivElement;
	let mouseX = $state(0.5);
	let mouseY = $state(0.5);
	let frame = 0;
	let animating = $state(true);

	let particleCount = $state(initialParticleCount);
	let connectionDist = $state(150);
	let attractionStrength = $state(0.08);
	let speedMultiplier = $state(1);
	let mode: InteractionMode = $state(initialMode);
	let controlsOpen = $state(false);

	// Virtual cursor for keyboard nav
	let virtualCursorActive = $state(false);
	let virtualX = $state(0.5);
	let virtualY = $state(0.5);

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

	let particles = $state<Particle[]>([]);
	let width = $state(600);
	let height = $state(400);
	let nextId = 0;

	// Connection lines computed in rAF tick
	let connections = $state<{ x1: number; y1: number; x2: number; y2: number; opacity: number }[]>(
		[]
	);

	function initParticles() {
		const cols = Math.round(Math.sqrt((particleCount * width) / height));
		const rows = Math.round(particleCount / cols);
		const p: Particle[] = [];
		nextId = 0;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (p.length >= particleCount) break;
				const baseX = ((col + 0.5) / cols) * width;
				const baseY = ((row + 0.5) / rows) * height;
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
		particles = p;
	}

	$effect(() => {
		if (!browser) return;
		// Re-init when particleCount changes (read it to create dependency)
		void particleCount;
		initParticles();
	});

	// Spatial hash for O(n) connection lookups
	function buildSpatialHash(pts: Particle[], cellSize: number) {
		const grid = new Map<string, Particle[]>();
		for (const p of pts) {
			const cx = Math.floor(p.x / cellSize);
			const cy = Math.floor(p.y / cellSize);
			const key = `${cx},${cy}`;
			const cell = grid.get(key);
			if (cell) cell.push(p);
			else grid.set(key, [p]);
		}
		return grid;
	}

	function computeConnections(pts: Particle[], dist: number, mx: number, my: number) {
		const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
		const grid = buildSpatialHash(pts, dist);
		const checked = new Set<string>();

		for (const p of pts) {
			const cx = Math.floor(p.x / dist);
			const cy = Math.floor(p.y / dist);

			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					const key = `${cx + dx},${cy + dy}`;
					const cell = grid.get(key);
					if (!cell) continue;

					for (const q of cell) {
						if (q.id <= p.id) continue;
						const pairKey = `${p.id},${q.id}`;
						if (checked.has(pairKey)) continue;
						checked.add(pairKey);

						const ddx = p.x - q.x;
						const ddy = p.y - q.y;
						const d = Math.sqrt(ddx * ddx + ddy * ddy);
						if (d < dist) {
							// Brighter near cursor
							const midX = (p.x + q.x) / 2;
							const midY = (p.y + q.y) / 2;
							const cursorDist = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2);
							const cursorBoost = Math.max(0, 1 - cursorDist / 250) * 0.4;
							lines.push({
								x1: p.x,
								y1: p.y,
								x2: q.x,
								y2: q.y,
								opacity: (1 - d / dist) * (0.4 + cursorBoost)
							});
						}
					}
				}
			}
		}
		return lines;
	}

	$effect(() => {
		if (!browser || !animating || !active) return;

		let raf: number;

		function tick() {
			frame++;
			const t = frame * 0.02 * speedMultiplier;
			const mx = (virtualCursorActive ? virtualX : mouseX) * width;
			const my = (virtualCursorActive ? virtualY : mouseY) * height;
			const DAMPING = 0.96;

			for (const p of particles) {
				// Sinusoidal drift force
				const driftFx = Math.cos(t + p.phase) * 0.3 * speedMultiplier;
				const driftFy = -Math.sin(t * 0.7 + p.phase) * 0.3 * speedMultiplier;

				// Mouse interaction force
				const dx = mx - p.x;
				const dy = my - p.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const influence = Math.max(0, 1 - dist / 200);
				const dir = mode === 'repel' ? -1 : 1;
				const mouseFx = dx * influence * attractionStrength * dir;
				const mouseFy = dy * influence * attractionStrength * dir;

				// Spring force back to base
				const springFx = (p.baseX - p.x) * 0.005;
				const springFy = (p.baseY - p.y) * 0.005;

				// Accumulate forces into velocity
				p.vx += driftFx + mouseFx + springFx;
				p.vy += driftFy + mouseFy + springFy;

				// Damping
				p.vx *= DAMPING;
				p.vy *= DAMPING;

				// Integrate
				p.x += p.vx;
				p.y += p.vy;
			}

			// Compute connections with spatial hash
			connections = computeConnections(particles, connectionDist, mx, my);

			raf = requestAnimationFrame(tick);
		}

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	function getMousePos(e: MouseEvent | Touch) {
		const rect = wrapper?.getBoundingClientRect();
		if (!rect) return;
		mouseX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		mouseY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
		virtualCursorActive = false;
	}

	function handleMouseMove(e: MouseEvent) {
		getMousePos(e);
	}

	function handleMouseLeave() {
		mouseX = 0.5;
		mouseY = 0.5;
		virtualCursorActive = false;
	}

	function handleClick(e: MouseEvent) {
		if (mode !== 'spawn') return;
		const rect = wrapper?.getBoundingClientRect();
		if (!rect) return;
		if (particles.length >= 250) return;
		const cx = ((e.clientX - rect.left) / rect.width) * width;
		const cy = ((e.clientY - rect.top) / rect.height) * height;
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

	// Touch support
	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length > 0) {
			getMousePos(e.touches[0]);
		}
	}

	function handleTouchMove(e: TouchEvent) {
		e.preventDefault();
		if (e.touches.length > 0) {
			getMousePos(e.touches[0]);
		}
	}

	function handleTouchEnd() {
		mouseX = 0.5;
		mouseY = 0.5;
	}

	// Keyboard support
	function handleKeyDown(e: KeyboardEvent) {
		const step = 0.03;
		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				virtualCursorActive = true;
				virtualX = Math.max(0, virtualX - step);
				break;
			case 'ArrowRight':
				e.preventDefault();
				virtualCursorActive = true;
				virtualX = Math.min(1, virtualX + step);
				break;
			case 'ArrowUp':
				e.preventDefault();
				virtualCursorActive = true;
				virtualY = Math.max(0, virtualY - step);
				break;
			case 'ArrowDown':
				e.preventDefault();
				virtualCursorActive = true;
				virtualY = Math.min(1, virtualY + step);
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

	function particleDisplaySize(p: Particle): number {
		const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
		return p.size + Math.min(speed * 0.3, 2);
	}
</script>

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
	role="img"
	aria-label="Interactive particle network animation. Use arrow keys to move cursor, Space to pause, M to change mode."
>
	<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<filter id="glow">
				<feGaussianBlur stdDeviation="3" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>
		{#each connections as line, i (i)}
			<line
				x1={line.x1}
				y1={line.y1}
				x2={line.x2}
				y2={line.y2}
				stroke="var(--color-accent)"
				stroke-width="1"
				opacity={line.opacity}
			/>
		{/each}
		{#each particles as p, i (p.id)}
			<circle
				cx={p.x}
				cy={p.y}
				r={particleDisplaySize(p)}
				fill="var(--color-accent)"
				opacity={i % 3 === 0 ? 0.5 : 0.7}
				filter={i % 3 === 0 ? 'url(#glow)' : undefined}
			/>
		{/each}
	</svg>

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
				<label class="control-label">
					Mode
					<span class="control-value">{mode}</span>
				</label>
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
				<input type="range" min="24" max="200" step="1" bind:value={particleCount} />
			</label>

			<label class="control-group">
				<span class="control-label">
					Connect Distance
					<span class="control-value">{connectionDist}</span>
				</span>
				<input type="range" min="50" max="300" step="10" bind:value={connectionDist} />
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

	svg {
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
		transition: max-height 0.3s ease, padding 0.3s ease;
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
