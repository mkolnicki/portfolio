<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		active?: boolean;
	}

	const { active = true }: Props = $props();

	let tick = $state(0);

	$effect(() => {
		if (!browser || !active) return;
		const id = setInterval(() => {
			tick++;
		}, 120);
		return () => clearInterval(id);
	});

	interface Node {
		label: string;
		x: number;
		y: number;
		color: string;
	}

	const nodes: Node[] = [
		{ label: '$state', x: 15, y: 50, color: '#e06c75' },
		{ label: '$derived', x: 50, y: 25, color: '#e5c07b' },
		{ label: '$effect', x: 85, y: 50, color: '#61afef' },
	];

	const edges: [number, number][] = [
		[0, 1],
		[1, 2],
		[0, 2],
	];

	const CYCLE_LEN = 60;
	let pulseProgress = $derived((tick % CYCLE_LEN) / CYCLE_LEN);

	function edgePulsePos(from: Node, to: Node, progress: number): { x: number; y: number } {
		return {
			x: from.x + (to.x - from.x) * progress,
			y: from.y + (to.y - from.y) * progress,
		};
	}

	let activeEdge = $derived(Math.floor((tick / CYCLE_LEN) % edges.length));
</script>

<div class="graph">
	<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		<!-- Edges -->
		{#each edges as [from, to], i}
			{@const n1 = nodes[from]}
			{@const n2 = nodes[to]}
			<line
				x1={n1.x}
				y1={n1.y}
				x2={n2.x}
				y2={n2.y}
				stroke="var(--color-border)"
				stroke-width="0.5"
				opacity="0.4"
			/>
			<!-- Arrow head -->
			{@const angle = Math.atan2(n2.y - n1.y, n2.x - n1.x)}
			{@const ax = n2.x - Math.cos(angle) * 5}
			{@const ay = n2.y - Math.sin(angle) * 5}
			<polygon
				points="{n2.x - Math.cos(angle) * 4},{n2.y - Math.sin(angle) * 4} {ax - Math.cos(angle - 0.5) * 2},{ay - Math.sin(angle - 0.5) * 2} {ax - Math.cos(angle + 0.5) * 2},{ay - Math.sin(angle + 0.5) * 2}"
				fill="var(--color-border)"
				opacity="0.4"
			/>
			<!-- Pulse dot -->
			{#if i === activeEdge}
				{@const pos = edgePulsePos(n1, n2, pulseProgress)}
				<circle cx={pos.x} cy={pos.y} r="1.5" fill="var(--color-accent)" opacity="0.9">
				</circle>
				<circle cx={pos.x} cy={pos.y} r="3" fill="var(--color-accent)" opacity="0.2" />
			{/if}
		{/each}

		<!-- Nodes -->
		{#each nodes as node, i}
			<circle
				cx={node.x}
				cy={node.y}
				r="6"
				fill="var(--color-bg-subtle)"
				stroke={node.color}
				stroke-width="1"
				opacity={activeEdge === i || edges[activeEdge][1] === i ? 1 : 0.5}
			/>
			<text
				x={node.x}
				y={node.y + 12}
				text-anchor="middle"
				font-size="4"
				font-family="var(--font-mono)"
				fill={node.color}
				opacity="0.8"
			>{node.label}</text>
		{/each}
	</svg>
</div>

<style>
	.graph {
		width: 100%;
		height: 100%;
		background: var(--color-bg-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	svg {
		width: 100%;
		height: 100%;
	}
</style>
