<script lang="ts">
	import { browser } from '$app/environment';

	const MSG = 'ATTACK AT DAWN';
	const KEY = [0x4b, 0x45, 0x59];

	const CIPHER = Array.from(MSG)
		.map((c, i) =>
			(c.charCodeAt(0) ^ KEY[i % KEY.length]).toString(16).toUpperCase().padStart(2, '0')
		)
		.join(' ');

	let tick = $state(0);

	$effect(() => {
		if (!browser) return;
		const id = setInterval(() => {
			tick = (tick + 1) % 200;
		}, 40);
		return () => clearInterval(id);
	});

	let packetX = $derived(tick < 30 ? 0 : tick < 130 ? (tick - 30) / 100 : 1);
	let traveling = $derived(tick >= 30 && tick < 130);
	let arrived = $derived(tick >= 140);
</script>

<div class="demo">
	<header class="demo-label">CONFIDENTIALITY</header>

	<div class="scene">
		<div class="node">
			<div class="node-title">ALICE</div>
			<div class="terminal">
				<span class="dim">plain ▸</span>
				<span class="plain">{MSG}</span>
			</div>
			<div class="key-badge">🔑 KEY</div>
		</div>

		<div class="channel">
			<div class="wire-wrap">
				<div class="wire">
					{#if traveling}
						<div class="packet" style:left="{packetX * 100}%"></div>
					{/if}
				</div>
				<div class="channel-title">CHANNEL</div>
			</div>
			<div class="eve">
				<div class="eve-title">EVE</div>
				<div class="terminal eve-terminal">
					<span class="dim">intercepts ▸</span>
					<span class="cipher">{traveling || arrived ? CIPHER : '···'}</span>
				</div>
				<div class="no-key">✗ no key</div>
			</div>
		</div>

		<div class="node">
			<div class="node-title">BOB</div>
			<div class="terminal">
				<span class="dim">plain ▸</span>
				<span class="{arrived ? 'plain' : 'muted'}">{arrived ? MSG : '···'}</span>
			</div>
			<div class="key-badge">🔑 KEY</div>
		</div>
	</div>
</div>

<style>
	.demo {
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 1.25rem;
		margin: 2rem 0;
		font-family: var(--font-mono);
	}

	.demo-label {
		font-size: 0.6rem;
		letter-spacing: 0.15em;
		color: var(--color-text-muted);
		margin-bottom: 1.25rem;
	}

	.scene {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		gap: 1rem;
		align-items: start;
	}

	.node {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.node-title {
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		color: var(--color-accent);
	}

	.terminal {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.5rem 0.6rem;
		font-size: 0.65rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-height: 3rem;
	}

	.eve-terminal {
		min-height: 2rem;
	}

	.key-badge {
		font-size: 0.6rem;
		color: var(--color-accent);
		opacity: 0.7;
	}

	.channel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.wire-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.wire {
		position: relative;
		width: 100%;
		height: 2px;
		background: var(--color-border);
		border-radius: 1px;
	}

	.packet {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		background: var(--color-accent);
		border-radius: 50%;
		box-shadow: 0 0 6px var(--color-accent);
		transition: left 40ms linear;
	}

	.channel-title {
		font-size: 0.55rem;
		letter-spacing: 0.12em;
		color: var(--color-text-muted);
	}

	.eve {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.eve-title {
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		color: #e06c75;
	}

	.no-key {
		font-size: 0.6rem;
		color: #e06c75;
		opacity: 0.7;
	}

	.dim { color: var(--color-text-muted); }
	.plain { color: var(--color-text); word-break: break-all; }
	.cipher { color: #e5c07b; word-break: break-all; font-size: 0.6rem; }
	.muted { color: var(--color-border); }
</style>
