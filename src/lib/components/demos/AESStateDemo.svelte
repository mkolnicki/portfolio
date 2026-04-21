<script lang="ts">
	// One AES round on a known state, using NIST FIPS 197 Appendix B values
	// Initial state (input block after first AddRoundKey)
	const STATE_INITIAL = [
		['19', 'a0', '9a', 'e9'],
		['3d', 'f4', 'c6', 'f8'],
		['e3', 'e2', '8d', '48'],
		['be', '2b', '2a', '08']
	];

	// After SubBytes (S-box substitution)
	const STATE_SUBBYTES = [
		['d4', 'e0', 'b8', '1e'],
		['27', 'bf', 'b4', '41'],
		['11', '98', '5d', '52'],
		['ae', 'f1', 'e5', '30']
	];

	// After ShiftRows
	const STATE_SHIFTROWS = [
		['d4', 'e0', 'b8', '1e'],
		['bf', 'b4', '41', '27'],
		['5d', '52', '11', '98'],
		['30', 'ae', 'f1', 'e5']
	];

	// After AddRoundKey (round 1 key from NIST example)
	const STATE_ADDROUNDKEY = [
		['04', 'e0', '48', '28'],
		['66', 'cb', 'f8', '06'],
		['81', '19', 'd3', '26'],
		['e5', '9a', '7a', '4c']
	];

	type Step = 0 | 1 | 2 | 3;

	let step = $state<Step>(0);

	const STEPS: { label: string; state: string[][]; desc: string }[] = [
		{
			label: 'INITIAL STATE',
			state: STATE_INITIAL,
			desc: 'The 16-byte input block arranged as a 4×4 grid of bytes. Each cell is one byte in hex.'
		},
		{
			label: 'SUBBYTES',
			state: STATE_SUBBYTES,
			desc: 'Each byte is independently replaced using the S-box lookup table — a nonlinear substitution that prevents algebraic attacks.'
		},
		{
			label: 'SHIFTROWS',
			state: STATE_SHIFTROWS,
			desc: 'Row 0 unchanged. Row 1 shifts left by 1. Row 2 by 2. Row 3 by 3. Bytes spread across columns, setting up MixColumns.'
		},
		{
			label: 'ADDROUNDKEY',
			state: STATE_ADDROUNDKEY,
			desc: 'Each byte is XORed with the corresponding byte from the round key. This is the only step that directly incorporates the secret key.'
		}
	];

	function changedFromPrev(row: number, col: number): boolean {
		if (step === 0) return false;
		return STEPS[step].state[row][col] !== STEPS[step - 1].state[row][col];
	}

	function nextStep() {
		step = ((step + 1) % 4) as Step;
	}

	const stepNames = ['INITIAL', 'SUBBYTES', 'SHIFTROWS', 'ADDROUNDKEY'];
</script>

<div class="demo">
	<header class="demo-label">AES · STATE TRANSFORMATION</header>

	<div class="layout">
		<div class="state-panel">
			<div class="grid">
				{#each STEPS[step].state as row, r}
					{#each row as cell, c}
						<div class="cell {changedFromPrev(r, c) ? 'changed' : ''}">
							{cell}
						</div>
					{/each}
				{/each}
			</div>
		</div>

		<div class="info-panel">
			<div class="step-label">{STEPS[step].label}</div>
			<div class="step-desc">{STEPS[step].desc}</div>

			<div class="progress">
				{#each stepNames as name, i}
					<div class="progress-item {i === step ? 'active' : i < step ? 'done' : ''}">
						{name}
					</div>
				{/each}
			</div>
		</div>
	</div>

	{#if step === 2}
		<div class="shiftrows-note">
			<span class="row-shift">Row 0</span> → no shift &nbsp;
			<span class="row-shift">Row 1</span> → ←1 &nbsp;
			<span class="row-shift">Row 2</span> → ←2 &nbsp;
			<span class="row-shift">Row 3</span> → ←3
		</div>
	{/if}

	<div class="controls">
		<button class="btn" onclick={nextStep}>
			{step < 3 ? 'NEXT STEP →' : 'RESTART'}
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
		margin-bottom: 1.25rem;
	}

	.layout {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1.5rem;
		align-items: start;
	}

	.state-panel {
		flex-shrink: 0;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 3px;
	}

	.cell {
		width: 2.4rem;
		height: 2.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		letter-spacing: 0.05em;
		border: 1px solid var(--color-border-subtle);
		border-radius: 3px;
		background: var(--color-surface);
		color: var(--color-text-muted);
		transition: all 0.25s ease;
	}

	.cell.changed {
		color: var(--color-accent);
		border-color: var(--color-accent);
		background: rgba(97, 175, 239, 0.08);
	}

	.info-panel {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.step-label {
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		color: var(--color-accent);
	}

	.step-desc {
		font-size: 0.68rem;
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	.progress {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		margin-top: 0.25rem;
	}

	.progress-item {
		font-size: 0.55rem;
		letter-spacing: 0.1em;
		color: var(--color-border);
		padding: 0.15rem 0;
		transition: color 0.2s;
	}

	.progress-item.done {
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.progress-item.active {
		color: var(--color-accent);
	}

	.shiftrows-note {
		margin-top: 0.75rem;
		font-size: 0.62rem;
		color: var(--color-text-muted);
		opacity: 0.8;
	}

	.row-shift {
		color: var(--color-accent);
		opacity: 0.8;
	}

	.controls {
		margin-top: 1rem;
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

	@media (max-width: 520px) {
		.layout {
			grid-template-columns: 1fr;
		}

		.cell {
			width: 2rem;
			height: 2rem;
			font-size: 0.62rem;
		}
	}
</style>
