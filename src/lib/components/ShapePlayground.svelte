<script lang="ts">
	import { browser } from '$app/environment';

	interface Shape {
		id: number;
		type: 'circle' | 'rectangle' | 'triangle';
		x: number;
		y: number;
		color: string;
		phase: number;
	}

	const colors = ['#e06c75', '#61afef', '#e5c07b', '#98c379', '#c678dd'];
	const shapeTypes: Shape['type'][] = ['circle', 'rectangle', 'triangle'];

	let shapes = $state<Shape[]>([
		{ id: 1, type: 'circle', x: 100, y: 100, color: '#e06c75', phase: 0 },
		{ id: 2, type: 'rectangle', x: 250, y: 120, color: '#61afef', phase: 1.5 },
		{ id: 3, type: 'triangle', x: 400, y: 110, color: '#e5c07b', phase: 3 }
	]);

	let tab: 'before' | 'after' = $state('before');
	let time = $state(0);
	let nextId = $state(4);
	let paused = $state(false);

	const reducedMotion = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	$effect(() => {
		if (reducedMotion || paused) return;
		let frame: number;
		function tick() {
			time = performance.now() / 1000;
			frame = requestAnimationFrame(tick);
		}
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	function animatedY(shape: Shape): number {
		return shape.y + Math.sin(time * 1.2 + shape.phase) * 10;
	}

	function animatedScale(shape: Shape): number {
		return 1 + Math.sin(time * 0.8 + shape.phase + 1) * 0.06;
	}

	function addShape() {
		const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
		const color = colors[Math.floor(Math.random() * colors.length)];
		shapes.push({
			id: nextId++,
			type,
			x: 60 + Math.random() * 400,
			y: 50 + Math.random() * 120,
			color,
			phase: Math.random() * Math.PI * 2
		});
	}

	function removeShape() {
		if (shapes.length > 0) {
			shapes.pop();
		}
	}

	function getTrianglePoints(cx: number, cy: number, size: number): string {
		const h = size * 0.866;
		return `${cx},${cy - h / 2} ${cx - size / 2},${cy + h / 2} ${cx + size / 2},${cy + h / 2}`;
	}
</script>

<div class="playground">
	<div class="tabs" role="tablist">
		<button
			role="tab"
			aria-selected={tab === 'before'}
			class="tab"
			class:active={tab === 'before'}
			onclick={() => (tab = 'before')}
		>
			Procedural
		</button>
		<button
			role="tab"
			aria-selected={tab === 'after'}
			class="tab"
			class:active={tab === 'after'}
			onclick={() => (tab = 'after')}
		>
			With Inheritance
		</button>
	</div>

	<div class="canvas-area">
		<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated shape rendering demo">
			{#each shapes as shape (shape.id)}
				{@const ay = animatedY(shape)}
				{@const sc = animatedScale(shape)}
				{#if shape.type === 'circle'}
					<circle
						cx={shape.x}
						cy={ay}
						r={22 * sc}
						fill={shape.color}
						opacity="0.85"
					/>
				{:else if shape.type === 'rectangle'}
					<rect
						x={shape.x - 22 * sc}
						y={ay - 16 * sc}
						width={44 * sc}
						height={32 * sc}
						rx="4"
						fill={shape.color}
						opacity="0.85"
					/>
				{:else}
					<polygon
						points={getTrianglePoints(shape.x, ay, 44 * sc)}
						fill={shape.color}
						opacity="0.85"
					/>
				{/if}
			{/each}
		</svg>

		<div class="controls">
			<button class="btn" onclick={addShape}>+ Add Shape</button>
			<button class="btn" onclick={removeShape} disabled={shapes.length === 0}>- Remove</button>
			<button class="btn" onclick={() => (paused = !paused)}>
				{paused ? 'Play' : 'Pause'}
			</button>
			<span class="count">{shapes.length} shape{shapes.length !== 1 ? 's' : ''}</span>
		</div>
	</div>

	<div class="code-panel">
		{#if tab === 'before'}
			<div class="code-label">Every new shape means more branches everywhere:</div>
			<pre><code>{`function draw(shape) {
  if (shape.type === 'circle') {
    drawCircle(shape.x, shape.y, shape.radius);
  } else if (shape.type === 'rectangle') {
    drawRect(shape.x, shape.y, shape.w, shape.h);
  } else if (shape.type === 'triangle') {
    drawTriangle(shape.x, shape.y, shape.base);
  }
  // add pentagon? another else-if...
}

function area(shape) {
  if (shape.type === 'circle') {
    return Math.PI * shape.radius ** 2;
  } else if (shape.type === 'rectangle') {
    return shape.w * shape.h;
  } else if (shape.type === 'triangle') {
    return 0.5 * shape.base * shape.height;
  }
  // same branching, repeated...
}`}</code></pre>
		{:else}
			<div class="code-label">New shapes just extend the base — no existing code changes:</div>
			<pre><code>{`class Shape {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
  }
  draw() { throw new Error('implement me'); }
  area() { throw new Error('implement me'); }
}

class Circle extends Shape {
  constructor(x, y, color, radius) {
    super(x, y, color);
    this.radius = radius;
  }
  draw()  { drawCircle(this.x, this.y, this.radius); }
  area()  { return Math.PI * this.radius ** 2; }
}

// Adding Pentagon? Just one new class.
// Zero changes to Shape, Circle, or Rectangle.`}</code></pre>
		{/if}
	</div>
</div>

<style>
	.playground {
		margin: 2rem 0;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--color-bg-subtle);
	}

	.tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.tab {
		flex: 1;
		padding: 0.6rem 1rem;
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		cursor: pointer;
		transition: color var(--transition-fast), background var(--transition-fast);
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab.active {
		color: var(--color-accent);
		background: var(--color-surface);
		border-bottom: 2px solid var(--color-accent);
	}

	.canvas-area {
		padding: 1rem;
	}

	svg {
		width: 100%;
		height: auto;
		display: block;
		background: var(--color-bg);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-subtle);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.75rem;
		flex-wrap: wrap;
	}

	.btn {
		padding: 0.3rem 0.7rem;
		font-size: 0.8rem;
		font-family: var(--font-mono);
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	.btn:hover:not(:disabled) {
		border-color: var(--color-accent);
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.count {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin-left: auto;
	}

	.code-panel {
		border-top: 1px solid var(--color-border-subtle);
		padding: 1rem;
	}

	.code-label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
	}

	pre {
		margin: 0;
		padding: 1rem;
		background: var(--color-bg);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-subtle);
		overflow-x: auto;
	}

	code {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--color-text);
	}
</style>
