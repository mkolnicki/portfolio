<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		active?: boolean;
	}

	const { active = true }: Props = $props();

	const SUCCESS = '#28c840';
	const RUNNING = '#61afef';
	const QUEUED = '#8E8E9E';
	const FAILED = '#e06c75';
	const ACCENT = '#01796F';

	const WIDTH = 700;
	const HEIGHT = 340;
	const NODE_W = 84;
	const NODE_H = 34;

	type NodeStatus = 'queued' | 'waiting' | 'running' | 'done' | 'failed';

	interface DAGNode {
		id: string;
		label: string;
		x: number;
		y: number;
		status: NodeStatus;
		progress: number;
		baseDuration: number;
	}

	interface Edge {
		from: string;
		to: string;
	}

	interface Packet {
		id: number;
		edge: Edge;
		t: number;
	}

	// Layout: 5 columns, centered vertically per column
	const nodeData: Omit<DAGNode, 'status' | 'progress'>[] = [
		{ id: 'ingest',    label: 'Ingest',    x: 60,  y: 170, baseDuration: 35 },
		{ id: 'validate',  label: 'Validate',  x: 200, y: 100, baseDuration: 28 },
		{ id: 'parse',     label: 'Parse',     x: 200, y: 240, baseDuration: 22 },
		{ id: 'enrich',    label: 'Enrich',    x: 350, y: 100, baseDuration: 32 },
		{ id: 'transform', label: 'Transform', x: 350, y: 240, baseDuration: 26 },
		{ id: 'merge',     label: 'Merge',     x: 490, y: 170, baseDuration: 38 },
		{ id: 'load',      label: 'Load',      x: 625, y: 115, baseDuration: 20 },
		{ id: 'index',     label: 'Index',     x: 625, y: 225, baseDuration: 18 },
	];

	const edges: Edge[] = [
		{ from: 'ingest',    to: 'validate' },
		{ from: 'ingest',    to: 'parse' },
		{ from: 'validate',  to: 'enrich' },
		{ from: 'parse',     to: 'transform' },
		{ from: 'enrich',    to: 'merge' },
		{ from: 'transform', to: 'merge' },
		{ from: 'merge',     to: 'load' },
		{ from: 'merge',     to: 'index' },
	];

	const deps: Record<string, string[]> = {};
	for (const e of edges) {
		if (!deps[e.to]) deps[e.to] = [];
		deps[e.to].push(e.from);
	}

	let nodes = $state<DAGNode[]>(nodeData.map(n => ({ ...n, status: 'queued', progress: 0 })));
	let packets = $state<Packet[]>([]);
	let nextPktId = 0;
	let autoPlay = $state(true);
	let totalRuns = $state(0);

	function getNode(id: string): DAGNode {
		return nodes.find(n => n.id === id)!;
	}

	function statusColor(s: NodeStatus): string {
		switch (s) {
			case 'done': return SUCCESS;
			case 'running': return RUNNING;
			case 'waiting': return ACCENT;
			case 'failed': return FAILED;
			default: return QUEUED;
		}
	}

	function statusLabel(s: NodeStatus): string {
		switch (s) {
			case 'done': return 'DONE';
			case 'running': return 'RUN';
			case 'waiting': return 'WAIT';
			case 'failed': return 'ERR';
			default: return 'IDLE';
		}
	}

	// Track which incoming edges have had their packet arrive
	let arrivedEdges = $state(new Set<string>());

	function edgeKey(e: Edge): string {
		return `${e.from}->${e.to}`;
	}

	function resetPipeline() {
		for (const n of nodes) {
			n.status = 'queued';
			n.progress = 0;
		}
		packets = [];
		arrivedEdges = new Set();
	}

	function advanceTick() {
		// If pipeline complete, restart
		const terminals = nodes.filter(n => !edges.some(e => e.from === n.id));
		if (terminals.every(t => t.status === 'done')) {
			totalRuns++;
			resetPipeline();
			return;
		}

		// The root node (no deps) starts immediately
		for (const n of nodes) {
			if (n.status !== 'queued') continue;
			const nodeDeps = deps[n.id] || [];
			if (nodeDeps.length === 0) {
				n.status = 'running';
			}
		}

		// Nodes with deps: when upstream completes, transition to 'waiting'
		// (packets are in flight). Only start 'running' when all packets arrive.
		for (const n of nodes) {
			if (n.status !== 'queued') continue;
			const nodeDeps = deps[n.id] || [];
			if (nodeDeps.length > 0 && nodeDeps.every(d => getNode(d).status === 'done')) {
				n.status = 'waiting';
			}
		}

		// Check waiting nodes: start running when all incoming packets have arrived
		for (const n of nodes) {
			if (n.status !== 'waiting') continue;
			const incomingEdges = edges.filter(e => e.to === n.id);
			if (incomingEdges.every(e => arrivedEdges.has(edgeKey(e)))) {
				n.status = 'running';
				// Clean up arrival records for this node
				for (const e of incomingEdges) arrivedEdges.delete(edgeKey(e));
			}
		}

		// Progress running nodes
		for (const n of nodes) {
			if (n.status !== 'running') continue;
			n.progress = Math.min(1, n.progress + 1 / n.baseDuration);
			if (n.progress >= 1) {
				if (n.id !== 'ingest' && n.id !== 'load' && n.id !== 'index' && Math.random() < 0.04) {
					n.status = 'failed';
					setTimeout(() => {
						if (n.status === 'failed') {
							n.status = 'queued';
							n.progress = 0;
						}
					}, autoPlay ? 1000 : 0);
				} else {
					n.status = 'done';
					for (const e of edges) {
						if (e.from === n.id) {
							packets = [...packets, { id: nextPktId++, edge: e, t: 0 }];
						}
					}
				}
			}
		}

		// Advance packets, record arrivals
		const surviving: Packet[] = [];
		for (const p of packets) {
			const next = { ...p, t: p.t + 0.05 };
			if (next.t >= 1) {
				arrivedEdges.add(edgeKey(p.edge));
			} else {
				surviving.push(next);
			}
		}
		packets = surviving;
	}

	// Auto-play loop
	$effect(() => {
		if (!browser || !active || !autoPlay) return;
		const id = setInterval(advanceTick, 70);
		return () => clearInterval(id);
	});

	function handleStep() {
		// Step = advance ~8 ticks at once to make progress visible
		for (let i = 0; i < 8; i++) advanceTick();
	}

	function handleReset() {
		totalRuns = 0;
		resetPipeline();
	}

	function handleToggleAuto() {
		autoPlay = !autoPlay;
	}

	// Edge path: exit right side of from-node, enter left side of to-node
	function edgePath(e: Edge): string {
		const from = getNode(e.from);
		const to = getNode(e.to);
		const x1 = from.x + NODE_W / 2;
		const y1 = from.y;
		const x2 = to.x - NODE_W / 2;
		const y2 = to.y;
		const mx = (x1 + x2) / 2;
		return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
	}

	function packetPos(p: Packet): { x: number; y: number } {
		const from = getNode(p.edge.from);
		const to = getNode(p.edge.to);
		const x1 = from.x + NODE_W / 2;
		const y1 = from.y;
		const x2 = to.x - NODE_W / 2;
		const y2 = to.y;
		const mx = (x1 + x2) / 2;
		const t = p.t;
		const it = 1 - t;
		const x = it*it*it*x1 + 3*it*it*t*mx + 3*it*t*t*mx + t*t*t*x2;
		const y = it*it*it*y1 + 3*it*it*t*y1 + 3*it*t*t*y2 + t*t*t*y2;
		return { x, y };
	}

	let activeCount = $derived(nodes.filter(n => n.status === 'running' || n.status === 'waiting').length);
	let doneCount = $derived(nodes.filter(n => n.status === 'done').length);
</script>

<div class="pipeline">
	<div class="header">
		<div class="header__left">
			<span class="header__title">PIPELINE ORCHESTRATOR</span>
			<span class="header__badge" class:healthy={activeCount > 0 || doneCount === nodes.length}>
				{#if activeCount > 0}EXECUTING{:else if doneCount === nodes.length}COMPLETE{:else}IDLE{/if}
			</span>
		</div>
		<div class="header__right">
			<span class="header__stat">
				<span class="header__label">RUNS</span>
				<span class="header__value">{totalRuns}</span>
			</span>
			<span class="header__stat">
				<span class="header__label">STAGES</span>
				<span class="header__value" style="color: {SUCCESS}">{doneCount}<span style="color: var(--color-text-muted)">/{nodes.length}</span></span>
			</span>
		</div>
	</div>

	<div class="dag-area">
		<svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg">
			<!-- Subtle grid -->
			{#each Array(6) as _, i}
				<line x1={0} y1={(i + 1) * 56} x2={WIDTH} y2={(i + 1) * 56} stroke="var(--color-border-subtle)" stroke-width="0.3" />
			{/each}

			<!-- Edges -->
			{#each edges as e (`${e.from}-${e.to}`)}
				{@const fromNode = getNode(e.from)}
				{@const edgeActive = fromNode.status === 'done' || fromNode.status === 'running'}
				<path
					d={edgePath(e)}
					fill="none"
					stroke={edgeActive ? ACCENT : 'var(--color-border-subtle)'}
					stroke-width={edgeActive ? 1.2 : 0.7}
					opacity={edgeActive ? 0.5 : 0.2}
				/>
			{/each}

			<!-- Arrow heads (at the left edge of target nodes) -->
			{#each edges as e (`arrow-${e.from}-${e.to}`)}
				{@const toNode = getNode(e.to)}
				{@const fromNode = getNode(e.from)}
				{@const edgeActive = fromNode.status === 'done' || fromNode.status === 'running'}
				{@const ax = toNode.x - NODE_W / 2 - 1}
				{@const ay = toNode.y}
				<polygon
					points="{ax - 5},{ay - 3} {ax},{ay} {ax - 5},{ay + 3}"
					fill={edgeActive ? ACCENT : 'var(--color-border-subtle)'}
					opacity={edgeActive ? 0.5 : 0.2}
				/>
			{/each}

			<!-- Packets -->
			{#each packets as p (p.id)}
				{@const pos = packetPos(p)}
				<circle cx={pos.x} cy={pos.y} r="3" fill={ACCENT} opacity={1 - p.t * 0.5} />
				<circle cx={pos.x} cy={pos.y} r="7" fill={ACCENT} opacity={(1 - p.t) * 0.1} />
			{/each}

			<!-- Nodes -->
			{#each nodes as n (n.id)}
				{@const color = statusColor(n.status)}
				{@const x = n.x - NODE_W / 2}
				{@const y = n.y - NODE_H / 2}

				<!-- Shadow for active nodes -->
				{#if n.status === 'running' || n.status === 'done'}
					<rect {x} {y} width={NODE_W} height={NODE_H} rx="6" fill={color} opacity="0.06" transform="translate(0, 2)" />
				{/if}

				<!-- Node box -->
				<rect
					{x} {y}
					width={NODE_W} height={NODE_H}
					rx="6"
					fill="var(--color-surface)"
					stroke={color}
					stroke-width={n.status === 'running' ? 1.2 : 0.7}
					opacity={n.status === 'queued' || n.status === 'waiting' ? 0.6 : 1}
				/>

				<!-- Progress bar track -->
				<rect x={x + 4} y={y + NODE_H - 7} width={NODE_W - 8} height="3" rx="1.5" fill="var(--color-border-subtle)" opacity="0.4" />

				<!-- Progress bar fill -->
				{#if n.progress > 0}
					<rect
						x={x + 4} y={y + NODE_H - 7}
						width={(NODE_W - 8) * n.progress} height="3"
						rx="1.5"
						fill={color}
						opacity="0.8"
					/>
				{/if}

				<!-- Pulse ring on running -->
				{#if n.status === 'running'}
					<rect {x} {y} width={NODE_W} height={NODE_H} rx="6" fill="none" stroke={RUNNING} stroke-width="0.6">
						<animate attributeName="opacity" values="0.4;0" dur="1.5s" repeatCount="indefinite" />
					</rect>
				{/if}

				<!-- Status dot -->
				<circle cx={x + 10} cy={y + 12} r="2.5" fill={color} opacity={n.status === 'queued' ? 0.4 : 0.9} />

				<!-- Label -->
				<text
					x={x + 18} y={y + 13}
					font-size="8"
					font-family="var(--font-mono)"
					font-weight="500"
					fill={n.status === 'queued' ? 'var(--color-text-muted)' : 'var(--color-text)'}
					dominant-baseline="middle"
				>{n.label}</text>

				<!-- Status label -->
				<text
					x={x + NODE_W - 6} y={y + 13}
					font-size="5.5"
					font-family="var(--font-mono)"
					fill={color}
					opacity="0.7"
					dominant-baseline="middle"
					text-anchor="end"
				>{statusLabel(n.status)}</text>
			{/each}
		</svg>
	</div>

	<div class="controls">
		<div class="controls__left">
			<button class="ctrl-btn" onclick={handleToggleAuto}>
				{autoPlay ? 'Pause' : 'Auto'}
			</button>
			<button class="ctrl-btn" onclick={handleStep} disabled={autoPlay}>
				Step
			</button>
			<button class="ctrl-btn" onclick={handleReset}>
				Reset
			</button>
		</div>
		<div class="controls__legend">
			<span class="legend-item"><span class="legend-dot" style="background: {QUEUED}"></span>Idle</span>
			<span class="legend-item"><span class="legend-dot" style="background: {RUNNING}"></span>Running</span>
			<span class="legend-item"><span class="legend-dot" style="background: {SUCCESS}"></span>Done</span>
			<span class="legend-item"><span class="legend-dot" style="background: {FAILED}"></span>Error</span>
		</div>
	</div>
</div>

<style>
	.pipeline {
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.header__left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header__title {
		font-size: 0.7rem;
		font-family: var(--font-mono);
		font-weight: 600;
		color: var(--color-text);
	}

	.header__badge {
		font-size: 0.55rem;
		font-family: var(--font-mono);
		padding: 0.1rem 0.4rem;
		border-radius: 100px;
		background: color-mix(in srgb, var(--color-text-muted) 15%, transparent);
		color: var(--color-text-muted);
	}

	.header__badge.healthy {
		background: color-mix(in srgb, #28c840 15%, transparent);
		color: #28c840;
	}

	.header__right {
		display: flex;
		gap: 1rem;
	}

	.header__stat {
		display: flex;
		gap: 0.3rem;
		font-size: 0.6rem;
		font-family: var(--font-mono);
	}

	.header__label { color: var(--color-text-muted); }
	.header__value { color: var(--color-text); }

	.dag-area {
		flex: 1;
		padding: 0.5rem;
		min-height: 0;
	}

	.dag-area svg {
		width: 100%;
		height: 100%;
	}

	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4rem 0.75rem;
		border-top: 1px solid var(--color-border-subtle);
		gap: 0.5rem;
	}

	.controls__left {
		display: flex;
		gap: 0.3rem;
	}

	.ctrl-btn {
		padding: 0.2rem 0.65rem;
		font-size: 0.6rem;
		font-family: var(--font-mono);
		background: var(--color-surface);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: color 150ms ease, border-color 150ms ease;
	}

	.ctrl-btn:hover:not(:disabled) {
		color: var(--color-text);
		border-color: var(--color-border);
	}

	.ctrl-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.controls__legend {
		display: flex;
		gap: 0.6rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.55rem;
		font-family: var(--font-mono);
		color: var(--color-text-muted);
	}

	.legend-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
	}

	@media (max-width: 500px) {
		.controls__legend { display: none; }
		.header__right { gap: 0.5rem; }
	}
</style>
