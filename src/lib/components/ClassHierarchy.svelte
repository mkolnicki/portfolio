<script lang="ts">
	import { browser } from '$app/environment';

	let visible = $state(false);
	let container: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!browser || !container) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.3 }
		);
		observer.observe(container);
		return () => observer.disconnect();
	});

	interface Box {
		label: string;
		x: number;
		y: number;
		w: number;
		h: number;
		color: string;
		delay: number;
		italic?: boolean;
		fields?: string[];
	}

	const boxes: Box[] = [
		{
			label: 'Shape',
			x: 210,
			y: 20,
			w: 140,
			h: 80,
			color: 'var(--color-accent)',
			delay: 0,
			italic: true,
			fields: ['x, y, color', 'draw(), area()']
		},
		{
			label: 'Circle',
			x: 30,
			y: 180,
			w: 130,
			h: 70,
			color: '#e06c75',
			delay: 200,
			fields: ['radius', 'draw(), area()']
		},
		{
			label: 'Rectangle',
			x: 215,
			y: 180,
			w: 130,
			h: 70,
			color: '#61afef',
			delay: 400,
			fields: ['width, height', 'draw(), area()']
		},
		{
			label: 'Triangle',
			x: 400,
			y: 180,
			w: 130,
			h: 70,
			color: '#e5c07b',
			delay: 600,
			fields: ['base, height', 'draw(), area()']
		}
	];

	interface Line {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		delay: number;
	}

	const lines: Line[] = [
		{ x1: 280, y1: 100, x2: 95, y2: 180, delay: 100 },
		{ x1: 280, y1: 100, x2: 280, y2: 180, delay: 300 },
		{ x1: 280, y1: 100, x2: 465, y2: 180, delay: 500 }
	];
</script>

<div class="hierarchy" bind:this={container} role="img" aria-label="Class hierarchy diagram showing Shape as parent class with Circle, Rectangle, and Triangle as child classes">
	<svg viewBox="0 0 560 280" xmlns="http://www.w3.org/2000/svg">
		{#each lines as line (line.delay)}
			<line
				x1={line.x1}
				y1={line.y1}
				x2={line.x2}
				y2={line.y2}
				class="connector"
				class:visible
				style:transition-delay="{line.delay}ms"
			/>
		{/each}

		{#each boxes as box (box.label)}
			<g
				class="box"
				class:visible
				style:transition-delay="{box.delay}ms"
			>
				<rect
					x={box.x}
					y={box.y}
					width={box.w}
					height={box.h}
					rx="6"
					fill="var(--color-surface)"
					stroke={box.color}
					stroke-width="1.5"
				/>
				<text
					x={box.x + box.w / 2}
					y={box.y + 22}
					text-anchor="middle"
					fill={box.color}
					font-size="14"
					font-weight="600"
					font-style={box.italic ? 'italic' : 'normal'}
				>
					{box.label}
				</text>
				{#if box.fields}
					<line
						x1={box.x + 8}
						y1={box.y + 32}
						x2={box.x + box.w - 8}
						y2={box.y + 32}
						stroke="var(--color-border-subtle)"
						stroke-width="0.5"
					/>
					{#each box.fields as field, i (field)}
						<text
							x={box.x + box.w / 2}
							y={box.y + 48 + i * 16}
							text-anchor="middle"
							fill="var(--color-text-muted)"
							font-size="11"
							font-family="var(--font-mono)"
						>
							{field}
						</text>
					{/each}
				{/if}
			</g>
		{/each}
	</svg>
</div>

<style>
	.hierarchy {
		margin: 2rem 0;
		padding: 1.5rem;
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.connector {
		stroke: var(--color-border);
		stroke-width: 1.5;
		stroke-dasharray: 4 3;
		opacity: 0;
		transition: opacity 500ms ease;
	}

	.connector.visible {
		opacity: 0.6;
	}

	.box {
		opacity: 0;
		transform: translateY(12px);
		transition:
			opacity 500ms ease,
			transform 500ms var(--ease-out-expo);
	}

	.box.visible {
		opacity: 1;
		transform: translateY(0);
	}
</style>
