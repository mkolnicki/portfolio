<script lang="ts">
	import { browser } from '$app/environment';

	// SHA-256 on a modern GPU: ~10 billion hashes/second
	// bcrypt cost=12: ~100 hashes/second per machine
	const SHA_RATE = 10_000_000_000;
	const BCRYPT_RATE = 100;

	// 8-char password space: uppercase + lowercase + digits + symbols = 95^8 ≈ 6.6 trillion
	const PASSWORD_SPACE = 95 ** 8;

	let shaCount = $state(0);
	let bcryptCount = $state(0);
	let running = $state(false);
	let elapsed = $state(0);

	let shaEta = $derived(Math.max(0, (PASSWORD_SPACE - shaCount) / SHA_RATE));
	let bcryptEta = $derived(Math.max(0, (PASSWORD_SPACE - bcryptCount) / BCRYPT_RATE));

	let shaFraction = $derived(Math.min(1, shaCount / PASSWORD_SPACE));
	let bcryptFraction = $derived(Math.min(1, bcryptCount / PASSWORD_SPACE));

	function fmtCount(n: number): string {
		if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
		if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
		if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
		if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
		return n.toString();
	}

	function fmtTime(seconds: number): string {
		if (seconds < 60) return seconds.toFixed(0) + 's';
		if (seconds < 3600) return (seconds / 60).toFixed(1) + 'm';
		if (seconds < 86400) return (seconds / 3600).toFixed(1) + 'h';
		if (seconds < 86400 * 365) return (seconds / 86400).toFixed(1) + 'd';
		return (seconds / (86400 * 365)).toFixed(1) + 'yr';
	}

	const TICK_MS = 50;
	// How much simulated time passes per real tick (compress time for demo)
	const TIME_SCALE = 0.05; // 1 real second = 0.05 simulated seconds → SHA exhausts in ~13s real time

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function start() {
		if (running) return;
		shaCount = 0;
		bcryptCount = 0;
		elapsed = 0;
		running = true;

		if (!browser) return;
		intervalId = setInterval(() => {
			const dt = (TICK_MS / 1000) * TIME_SCALE;
			elapsed += dt;

			shaCount = Math.min(PASSWORD_SPACE, shaCount + SHA_RATE * dt);
			bcryptCount = Math.min(PASSWORD_SPACE, bcryptCount + BCRYPT_RATE * dt);

			if (shaCount >= PASSWORD_SPACE && bcryptCount >= PASSWORD_SPACE) {
				clearInterval(intervalId!);
				running = false;
			}
		}, TICK_MS);
	}

	function reset() {
		if (intervalId) clearInterval(intervalId);
		running = false;
		shaCount = 0;
		bcryptCount = 0;
		elapsed = 0;
	}

	$effect(() => {
		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});

	const shaExhausted = $derived(shaCount >= PASSWORD_SPACE);
	const bcryptExhausted = $derived(bcryptCount >= PASSWORD_SPACE);
</script>

<div class="demo">
	<header class="demo-label">HASH SPEED · SHA-256 vs BCRYPT</header>

	<div class="context">
		Cracking an 8-character password by exhaustive search. Password space: 95⁸ ≈ {fmtCount(PASSWORD_SPACE)} combinations.
	</div>

	<div class="algorithms">
		<div class="algo">
			<div class="algo-header">
				<span class="algo-name">SHA-256</span>
				<span class="algo-rate">10B hashes/sec (GPU)</span>
			</div>
			<div class="bar-wrap">
				<div
					class="bar sha-bar {shaExhausted ? 'bar-done' : ''}"
					style:width="{shaFraction * 100}%"
				></div>
			</div>
			<div class="algo-stats">
				<span class="count">{fmtCount(shaCount)} checked</span>
				{#if shaExhausted}
					<span class="done">EXHAUSTED</span>
				{:else if running}
					<span class="eta">~{fmtTime(shaEta)} remaining</span>
				{:else}
					<span class="eta">~{fmtTime(PASSWORD_SPACE / SHA_RATE)} total</span>
				{/if}
			</div>
		</div>

		<div class="algo">
			<div class="algo-header">
				<span class="algo-name">bcrypt</span>
				<span class="algo-rate">100 hashes/sec (cost=12)</span>
			</div>
			<div class="bar-wrap">
				<div
					class="bar bcrypt-bar {bcryptExhausted ? 'bar-done' : ''}"
					style:width="{bcryptFraction * 100}%"
				></div>
			</div>
			<div class="algo-stats">
				<span class="count">{fmtCount(bcryptCount)} checked</span>
				{#if bcryptExhausted}
					<span class="done">EXHAUSTED</span>
				{:else if running || shaExhausted}
					<span class="eta safe">~{fmtTime(bcryptEta)} remaining</span>
				{:else}
					<span class="eta safe">~{fmtTime(PASSWORD_SPACE / BCRYPT_RATE)} total</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="controls">
		{#if !running && shaCount === 0}
			<button class="btn" onclick={start}>RUN SIMULATION</button>
		{:else if running}
			<button class="btn" onclick={reset}>RESET</button>
		{:else}
			<button class="btn" onclick={reset}>RESET</button>
		{/if}
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
		margin-bottom: 1rem;
	}

	.context {
		font-size: 0.68rem;
		color: var(--color-text-muted);
		margin-bottom: 1.25rem;
		line-height: 1.5;
	}

	.algorithms {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.algo {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.algo-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.algo-name {
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		color: var(--color-text);
	}

	.algo-rate {
		font-size: 0.58rem;
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.bar-wrap {
		height: 6px;
		background: var(--color-border-subtle);
		border-radius: 3px;
		overflow: hidden;
	}

	.bar {
		height: 100%;
		border-radius: 3px;
		transition: width 0.05s linear;
	}

	.sha-bar {
		background: #e06c75;
	}

	.sha-bar.bar-done {
		background: #e06c75;
	}

	.bcrypt-bar {
		background: var(--color-accent);
	}

	.bcrypt-bar.bar-done {
		background: var(--color-accent);
	}

	.algo-stats {
		display: flex;
		justify-content: space-between;
		font-size: 0.6rem;
	}

	.count {
		color: var(--color-text-muted);
	}

	.eta {
		color: #e06c75;
	}

	.eta.safe {
		color: var(--color-accent);
	}

	.done {
		color: var(--color-text-muted);
		opacity: 0.5;
		font-size: 0.58rem;
	}

	.controls {
		margin-top: 1.25rem;
		display: flex;
		justify-content: flex-end;
	}

	.btn {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		padding: 0.3rem 0.85rem;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	.btn:hover {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}
</style>
