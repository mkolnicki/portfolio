<script lang="ts">
	import { browser } from '$app/environment';

	type Phase = 'idle' | 'signing' | 'verifying' | 'result';

	interface Scenario {
		sender: string;
		hasKey: boolean;
		phase: Phase;
	}

	let scenarios = $state<Scenario[]>([
		{ sender: 'ALICE', hasKey: true, phase: 'idle' },
		{ sender: 'UNKNOWN', hasKey: false, phase: 'idle' }
	]);

	let running = $state(false);

	async function runDemo() {
		if (running) return;
		running = true;

		scenarios = scenarios.map((s) => ({ ...s, phase: 'idle' }));
		await delay(300);

		scenarios = scenarios.map((s) => ({ ...s, phase: 'signing' }));
		await delay(1200);

		scenarios = scenarios.map((s) => ({ ...s, phase: 'verifying' }));
		await delay(1200);

		scenarios = scenarios.map((s) => ({ ...s, phase: 'result' }));
		await delay(2500);

		scenarios = scenarios.map((s) => ({ ...s, phase: 'idle' }));
		running = false;
	}

	function delay(ms: number) {
		return new Promise<void>((r) => setTimeout(r, ms));
	}

	const SIG_ALICE = 'a3f9b2c1...7e4b';
	const SIG_FAKE = '????????...????';

	function phaseLabel(s: Scenario): string {
		if (s.phase === 'idle') return 'ready';
		if (s.phase === 'signing') return s.hasKey ? 'signing with key...' : 'forging signature...';
		if (s.phase === 'verifying') return 'verifying...';
		return s.hasKey ? '✓ AUTHENTICATED' : '✗ REJECTED';
	}

	function sig(s: Scenario): string {
		if (s.phase === 'idle') return '—';
		if (s.phase === 'signing') return '···';
		return s.hasKey ? SIG_ALICE : SIG_FAKE;
	}
</script>

<div class="demo">
	<header class="demo-label">AUTHENTICATION</header>

	<div class="grid">
		{#each scenarios as s}
			<div class="card {s.phase === 'result' ? (s.hasKey ? 'card-ok' : 'card-bad') : ''}">
				<div class="card-header">
					<span class="sender {s.hasKey ? 'sender-ok' : 'sender-bad'}">{s.sender}</span>
					<span class="key-status {s.hasKey ? 'has-key' : 'no-key'}">
						{s.hasKey ? '🔑 private key' : '✗ no key'}
					</span>
				</div>

				<div class="message-block">
					<span class="field-label">MESSAGE</span>
					<span class="msg-text">ATTACK AT DAWN</span>
				</div>

				<div class="sig-block">
					<span class="field-label">SIGNATURE</span>
					<span class="sig {s.hasKey ? 'sig-real' : 'sig-fake'}">{sig(s)}</span>
				</div>

				<div class="phase-row phase-{s.phase} {s.phase === 'result' ? (s.hasKey ? 'result-ok' : 'result-bad') : ''}">
					{phaseLabel(s)}
				</div>
			</div>
		{/each}
	</div>

	<div class="controls">
		<button class="btn" onclick={runDemo} disabled={running}>
			{running ? 'RUNNING···' : 'RUN VERIFICATION'}
		</button>
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

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.75rem 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		transition: border-color var(--transition-base);
	}

	.card-ok { border-color: var(--color-accent); }
	.card-bad { border-color: #e06c75; }

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sender {
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		font-weight: 600;
	}

	.sender-ok { color: var(--color-accent); }
	.sender-bad { color: #e06c75; }

	.key-status {
		font-size: 0.6rem;
	}

	.has-key { color: var(--color-accent); opacity: 0.8; }
	.no-key { color: #e06c75; opacity: 0.8; }

	.message-block,
	.sig-block {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.field-label {
		font-size: 0.55rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.msg-text {
		font-size: 0.72rem;
		color: var(--color-text);
	}

	.sig {
		font-size: 0.65rem;
		letter-spacing: 0.02em;
	}

	.sig-real { color: var(--color-accent); }
	.sig-fake { color: #e06c75; }

	.phase-row {
		font-size: 0.65rem;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		padding-top: 0.4rem;
		border-top: 1px solid var(--color-border-subtle);
		transition: color var(--transition-base);
	}

	.result-ok { color: var(--color-accent); font-weight: 600; }
	.result-bad { color: #e06c75; font-weight: 600; }

	.controls {
		margin-top: 1rem;
		display: flex;
		justify-content: flex-end;
	}

	.btn {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		padding: 0.3rem 0.85rem;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: border-color var(--transition-fast), color var(--transition-fast);
	}

	.btn:hover:not(:disabled) {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 480px) {
		.grid { grid-template-columns: 1fr; }
	}
</style>
