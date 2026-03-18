<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		active?: boolean;
	}

	const { active = true }: Props = $props();

	const LEADER = '#01796F';
	const FOLLOWER = '#61afef';
	const CANDIDATE = '#e5c07b';
	const DEAD = '#e06c75';
	const DIM = '#8E8E9E';

	const WIDTH = 700;
	const HEIGHT = 360;
	const CX = 310;
	const CY = 175;
	const RING_R = 110;
	const NODE_COUNT = 5;

	type Role = 'leader' | 'follower' | 'candidate' | 'dead';

	interface RaftNode {
		id: number;
		label: string;
		role: Role;
		x: number;
		y: number;
		term: number;
		log: number;
	}

	interface Message {
		id: number;
		from: number;
		to: number;
		t: number;
		type: 'heartbeat' | 'vote-req' | 'vote-ack' | 'ack';
	}

	interface LogEntry {
		text: string;
		type: 'info' | 'warn' | 'success' | 'error';
	}

	type Phase = 'steady' | 'crash' | 'election' | 'voting' | 'elected' | 'recovery';

	const PHASE_LABELS: Record<Phase, string> = {
		steady: 'Leader sending heartbeats to all followers',
		crash: 'Leader node has crashed — timeout detected',
		election: 'Follower becomes candidate, requests votes',
		voting: 'Nodes casting votes for candidate',
		elected: 'Majority reached — new leader elected',
		recovery: 'Crashed node rejoining as follower',
	};

	let nextMsgId = 0;
	let term = $state(1);
	let phase = $state<Phase>('steady');
	let autoPlay = $state(true);
	let tickCount = $state(0);

	function nodePos(i: number): { x: number; y: number } {
		const angle = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
		return {
			x: CX + Math.cos(angle) * RING_R,
			y: CY + Math.sin(angle) * RING_R
		};
	}

	let nodes = $state<RaftNode[]>(
		Array.from({ length: NODE_COUNT }, (_, i) => ({
			id: i,
			label: `N${i}`,
			role: (i === 0 ? 'leader' : 'follower') as Role,
			...nodePos(i),
			term: 1,
			log: 0
		}))
	);

	let messages = $state<Message[]>([]);
	let logs = $state<LogEntry[]>([{ text: 'N0 elected leader — Term 1', type: 'success' }]);
	let votes = $state(new Map<number, number>());
	let candidateId = $state(-1);
	let deadNodeId = $state(-1);

	function addLog(text: string, type: LogEntry['type'] = 'info') {
		logs = [...logs.slice(-6), { text, type }];
	}

	function getLeader(): RaftNode | undefined {
		return nodes.find(n => n.role === 'leader');
	}

	function roleColor(r: Role): string {
		switch (r) {
			case 'leader': return LEADER;
			case 'candidate': return CANDIDATE;
			case 'dead': return DEAD;
			default: return FOLLOWER;
		}
	}

	function msgColor(type: Message['type']): string {
		switch (type) {
			case 'heartbeat': return LEADER;
			case 'vote-req': return CANDIDATE;
			default: return FOLLOWER;
		}
	}

	function logColor(type: LogEntry['type']): string {
		switch (type) {
			case 'success': return '#28c840';
			case 'warn': return CANDIDATE;
			case 'error': return DEAD;
			default: return DIM;
		}
	}

	// --- Phase transitions ---

	function doSteadyHeartbeat() {
		const leader = getLeader();
		if (!leader) return;
		leader.log++;
		for (const n of nodes) {
			if (n.id !== leader.id && n.role !== 'dead') {
				messages = [...messages, { id: nextMsgId++, from: leader.id, to: n.id, t: 0, type: 'heartbeat' }];
				n.log = leader.log;
			}
		}
		addLog(`N${leader.id} → heartbeat (log=${leader.log})`, 'info');
	}

	function doCrash() {
		const leader = getLeader();
		if (!leader) return;
		leader.role = 'dead';
		deadNodeId = leader.id;
		addLog(`N${leader.id} crashed — timeout`, 'error');
		phase = 'crash';
	}

	function doStartElection() {
		const followers = nodes.filter(n => n.role === 'follower');
		if (!followers.length) return;
		const cand = followers[Math.floor(Math.random() * followers.length)];
		term++;
		cand.role = 'candidate';
		cand.term = term;
		candidateId = cand.id;
		votes = new Map([[cand.id, 1]]);
		addLog(`N${cand.id} starts election — Term ${term}`, 'warn');
		phase = 'election';

		// Send vote requests
		for (const n of nodes) {
			if (n.id !== cand.id && n.role !== 'dead') {
				messages = [...messages, { id: nextMsgId++, from: cand.id, to: n.id, t: 0, type: 'vote-req' }];
			}
		}
	}

	function doVoting() {
		// Followers send vote acks back
		for (const n of nodes) {
			if (n.id !== candidateId && n.role !== 'dead' && n.role !== 'candidate') {
				n.term = term;
				messages = [...messages, { id: nextMsgId++, from: n.id, to: candidateId, t: 0, type: 'vote-ack' }];
			}
		}
		addLog(`Followers voting for N${candidateId}`, 'info');
		phase = 'voting';
	}

	function doElected() {
		const cand = nodes.find(n => n.id === candidateId);
		if (cand) {
			cand.role = 'leader';
			cand.term = term;
		}
		const majority = Math.floor(NODE_COUNT / 2) + 1;
		addLog(`N${candidateId} elected — ${majority}/${NODE_COUNT} votes`, 'success');
		phase = 'elected';
	}

	function doRecovery() {
		const dead = nodes.find(n => n.role === 'dead');
		if (dead) {
			dead.role = 'follower';
			dead.term = term;
			addLog(`N${dead.id} rejoined cluster`, 'info');
		}
		deadNodeId = -1;
		candidateId = -1;
		phase = 'recovery';
	}

	function doBackToSteady() {
		phase = 'steady';
	}

	// Ordered sequence of phases for stepping
	const phaseSequence: (() => void)[] = [
		doSteadyHeartbeat,   // 0: show heartbeats
		doSteadyHeartbeat,   // 1: another round
		doCrash,             // 2: leader dies
		doStartElection,     // 3: election starts
		doVoting,            // 4: votes cast
		doElected,           // 5: new leader
		doRecovery,          // 6: dead node recovers
		doBackToSteady,      // 7: back to normal
	];

	let stepIndex = $state(0);

	function advanceStep() {
		phaseSequence[stepIndex]();
		stepIndex = (stepIndex + 1) % phaseSequence.length;
	}

	// Animation tick: just advances messages
	function animationTick() {
		tickCount++;
		messages = messages
			.map(m => ({ ...m, t: m.t + 0.05 }))
			.filter(m => {
				if (m.t >= 1) {
					// Acks traveling back
					if (m.type === 'heartbeat') {
						messages = [...messages, { id: nextMsgId++, from: m.to, to: m.from, t: 0, type: 'ack' }];
					}
					return false;
				}
				return true;
			});
	}

	// Auto-play: advance a step every ~2.5s, animate every 60ms
	$effect(() => {
		if (!browser || !active) return;

		const animId = setInterval(animationTick, 60);
		let stepId: ReturnType<typeof setInterval> | undefined;

		if (autoPlay) {
			stepId = setInterval(advanceStep, 2500);
		}

		return () => {
			clearInterval(animId);
			if (stepId) clearInterval(stepId);
		};
	});

	function handleStep() {
		advanceStep();
	}

	function handleToggleAuto() {
		autoPlay = !autoPlay;
	}

	function handleReset() {
		term = 1;
		phase = 'steady';
		stepIndex = 0;
		messages = [];
		deadNodeId = -1;
		candidateId = -1;
		votes = new Map();
		logs = [{ text: 'N0 elected leader — Term 1', type: 'success' }];
		for (let i = 0; i < nodes.length; i++) {
			nodes[i].role = i === 0 ? 'leader' : 'follower';
			nodes[i].term = 1;
			nodes[i].log = 0;
		}
	}

	function msgPos(m: Message): { x: number; y: number } {
		const from = nodes[m.from];
		const to = nodes[m.to];
		return {
			x: from.x + (to.x - from.x) * m.t,
			y: from.y + (to.y - from.y) * m.t
		};
	}

	let aliveCount = $derived(nodes.filter(n => n.role !== 'dead').length);
</script>

<div class="raft">
	<div class="header">
		<div class="header__left">
			<span class="header__title">RAFT CONSENSUS</span>
			<span class="header__badge" class:healthy={phase === 'steady' || phase === 'elected' || phase === 'recovery'} class:electing={phase === 'election' || phase === 'voting' || phase === 'crash'}>
				{phase === 'steady' || phase === 'recovery' ? 'CONSENSUS' : phase === 'elected' ? 'ELECTED' : 'ELECTION'}
			</span>
		</div>
		<div class="header__right">
			<span class="header__stat">
				<span class="header__label">TERM</span>
				<span class="header__value">{term}</span>
			</span>
			<span class="header__stat">
				<span class="header__label">QUORUM</span>
				<span class="header__value" style="color: {aliveCount >= 3 ? '#28c840' : DEAD}">{aliveCount}/{NODE_COUNT}</span>
			</span>
		</div>
	</div>

	<div class="main">
		<div class="ring-area">
			<svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg">
				<!-- Ring -->
				<circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="var(--color-border-subtle)" stroke-width="0.5" stroke-dasharray="4,4" />

				<!-- Connections -->
				{#each nodes as n, i (n.id)}
					{@const next = nodes[(i + 1) % NODE_COUNT]}
					<line x1={n.x} y1={n.y} x2={next.x} y2={next.y} stroke="var(--color-border-subtle)" stroke-width="0.3" opacity="0.3" />
				{/each}

				<!-- Messages in flight -->
				{#each messages as m (m.id)}
					{@const pos = msgPos(m)}
					<circle cx={pos.x} cy={pos.y} r={m.type === 'heartbeat' ? 4 : 3} fill={msgColor(m.type)} opacity={1 - m.t * 0.4} />
					{#if m.type === 'heartbeat' || m.type === 'vote-req'}
						<circle cx={pos.x} cy={pos.y} r="8" fill={msgColor(m.type)} opacity={(1 - m.t) * 0.08} />
					{/if}
				{/each}

				<!-- Nodes -->
				{#each nodes as n (n.id)}
					{@const color = roleColor(n.role)}
					{@const isLeader = n.role === 'leader'}

					{#if isLeader}
						<circle cx={n.x} cy={n.y} r="30" fill={LEADER} opacity="0.05" />
						<circle cx={n.x} cy={n.y} r="24" fill={LEADER} opacity="0.07" />
					{/if}

					<circle
						cx={n.x} cy={n.y}
						r={isLeader ? 20 : 16}
						fill="var(--color-surface)"
						stroke={color}
						stroke-width={isLeader ? 2 : 1}
						opacity={n.role === 'dead' ? 0.35 : 1}
					/>

					{#if isLeader}
						<text x={n.x} y={n.y - 6} text-anchor="middle" font-size="9" fill={LEADER} dominant-baseline="middle">&#9733;</text>
					{:else if n.role === 'dead'}
						<text x={n.x} y={n.y - 5} text-anchor="middle" font-size="11" fill={DEAD} dominant-baseline="middle" font-family="var(--font-mono)">&#10005;</text>
					{/if}

					<text
						x={n.x} y={n.y + (isLeader ? 6 : 4)}
						text-anchor="middle"
						font-size="8.5"
						font-family="var(--font-mono)"
						font-weight={isLeader ? '700' : '400'}
						fill={n.role === 'dead' ? DIM : 'var(--color-text)'}
						dominant-baseline="middle"
					>{n.label}</text>

					<text
						x={n.x} y={n.y + (isLeader ? 34 : 30)}
						text-anchor="middle"
						font-size="6"
						font-family="var(--font-mono)"
						fill={color}
						opacity="0.7"
					>{n.role.toUpperCase()}</text>

					{#if n.role === 'candidate'}
						<circle cx={n.x} cy={n.y} r="16" fill="none" stroke={CANDIDATE} stroke-width="0.8">
							<animate attributeName="r" values="16;28" dur="0.9s" repeatCount="indefinite" />
							<animate attributeName="opacity" values="0.5;0" dur="0.9s" repeatCount="indefinite" />
						</circle>
					{/if}
				{/each}
			</svg>
		</div>

		<!-- Event log -->
		<div class="log-panel">
			<div class="log-header">EVENT LOG</div>
			<div class="log-entries">
				{#each logs as entry, i (i)}
					<div class="log-entry">
						<span class="log-dot" style="background: {logColor(entry.type)}"></span>
						<span class="log-text" style="color: {logColor(entry.type)}">{entry.text}</span>
					</div>
				{/each}
			</div>
			<div class="phase-hint">{PHASE_LABELS[phase]}</div>
		</div>
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
			<span class="legend-item"><span class="legend-dot" style="background: {LEADER}"></span>Leader</span>
			<span class="legend-item"><span class="legend-dot" style="background: {FOLLOWER}"></span>Follower</span>
			<span class="legend-item"><span class="legend-dot" style="background: {CANDIDATE}"></span>Candidate</span>
			<span class="legend-item"><span class="legend-dot" style="background: {DEAD}"></span>Down</span>
		</div>
	</div>
</div>

<style>
	.raft {
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

	.header__left { display: flex; align-items: center; gap: 0.5rem; }

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
	}

	.header__badge.healthy {
		background: color-mix(in srgb, #28c840 15%, transparent);
		color: #28c840;
	}

	.header__badge.electing {
		background: color-mix(in srgb, #e5c07b 15%, transparent);
		color: #e5c07b;
	}

	.header__right { display: flex; gap: 1rem; }

	.header__stat {
		display: flex;
		gap: 0.3rem;
		font-size: 0.6rem;
		font-family: var(--font-mono);
	}

	.header__label { color: var(--color-text-muted); }
	.header__value { color: var(--color-text); }

	.main {
		flex: 1;
		display: flex;
		min-height: 0;
	}

	.ring-area {
		flex: 1;
		padding: 0.25rem;
	}

	.ring-area svg {
		width: 100%;
		height: 100%;
	}

	.log-panel {
		width: 190px;
		border-left: 1px solid var(--color-border-subtle);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.log-header {
		padding: 0.4rem 0.6rem;
		font-size: 0.6rem;
		font-family: var(--font-mono);
		color: var(--color-text-muted);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.log-entries {
		flex: 1;
		padding: 0.5rem 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		overflow: hidden;
	}

	.log-entry {
		display: flex;
		align-items: flex-start;
		gap: 0.35rem;
	}

	.log-dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 0.3rem;
	}

	.log-text {
		font-size: 0.55rem;
		font-family: var(--font-mono);
		line-height: 1.4;
	}

	.phase-hint {
		padding: 0.5rem 0.6rem;
		font-size: 0.55rem;
		font-family: var(--font-mono);
		color: var(--color-text-muted);
		border-top: 1px solid var(--color-border-subtle);
		line-height: 1.4;
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
		.log-panel { display: none; }
		.controls__legend { display: none; }
	}
</style>
