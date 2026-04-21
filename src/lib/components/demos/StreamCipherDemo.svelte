<script lang="ts">
	const MSG1 = 'ATTACK';
	const MSG2 = 'DEFEND';

	// Pre-generated pseudorandom keystream bytes
	const KEYSTREAM = [0x7f, 0x3a, 0xb2, 0x91, 0x4e, 0xd6];

	function encode(str: string, ks: number[]): number[] {
		return Array.from(str).map((c, i) => c.charCodeAt(0) ^ ks[i]);
	}

	function fmtBytes(bytes: number[]): string {
		return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
	}

	function fmtStr(str: string): string {
		return Array.from(str)
			.map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '02'))
			.join(' ');
	}

	const C1 = encode(MSG1, KEYSTREAM);
	const C2 = encode(MSG2, KEYSTREAM);
	const XOR_C = C1.map((b, i) => b ^ C2[i]);
	// XOR_C == MSG1 XOR MSG2 (key cancels perfectly)
	const MSG1_XOR_MSG2 = Array.from(MSG1).map((c, i) => c.charCodeAt(0) ^ MSG2.charCodeAt(i));

	let step = $state(0);

	function advance() {
		step = step < 2 ? step + 1 : 0;
	}

	const labels = ['ENCRYPT SECOND MESSAGE WITH SAME KEY', 'ATTACKER: XOR THE CIPHERTEXTS', 'RESET'];
</script>

<div class="demo">
	<header class="demo-label">STREAM CIPHER · KEYSTREAM REUSE ATTACK</header>

	<div class="panel">
		<div class="entry">
			<span class="lbl">KEYSTREAM</span>
			<span class="val ks">{fmtBytes(KEYSTREAM)}</span>
		</div>

		<div class="sep"></div>

		<div class="entry">
			<span class="lbl">MSG₁</span>
			<span class="val plain">{MSG1}</span>
			<span class="hex-aside">{fmtStr(MSG1)}</span>
		</div>
		<div class="entry">
			<span class="lbl">C₁ = MSG₁ ⊕ KS</span>
			<span class="val cipher">{fmtBytes(C1)}</span>
		</div>

		{#if step >= 1}
			<div class="sep"></div>
			<div class="entry fade-in">
				<span class="lbl">MSG₂</span>
				<span class="val plain">{MSG2}</span>
				<span class="hex-aside">{fmtStr(MSG2)}</span>
			</div>
			<div class="entry fade-in">
				<span class="lbl">C₂ = MSG₂ ⊕ KS</span>
				<span class="val cipher">{fmtBytes(C2)}</span>
			</div>
		{/if}

		{#if step >= 2}
			<div class="sep"></div>
			<div class="entry fade-in">
				<span class="lbl danger-lbl">C₁ ⊕ C₂</span>
				<span class="val danger">{fmtBytes(XOR_C)}</span>
			</div>
			<div class="entry fade-in">
				<span class="lbl danger-lbl">MSG₁ ⊕ MSG₂</span>
				<span class="val danger">{fmtBytes(MSG1_XOR_MSG2)}</span>
			</div>
		{/if}
	</div>

	{#if step >= 2}
		<div class="callout fade-in">
			The keystream cancelled: C₁ ⊕ C₂ = MSG₁ ⊕ MSG₂. The attacker now has the XOR of both
			plaintexts — enough to recover both with frequency analysis. Same key, same stream position:
			never.
		</div>
	{/if}

	<div class="controls">
		<button class="btn {step === 2 ? 'btn-reset' : ''}" onclick={advance}>
			{labels[step]}
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

	.panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.entry {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.lbl {
		font-size: 0.58rem;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		min-width: 8rem;
		flex-shrink: 0;
	}

	.val {
		font-size: 0.7rem;
		letter-spacing: 0.05em;
	}

	.plain { color: var(--color-text); }
	.ks { color: #e5c07b; }
	.cipher { color: #e06c75; }
	.danger { color: #e06c75; }
	.danger-lbl { color: #e06c75; }

	.hex-aside {
		font-size: 0.58rem;
		color: var(--color-text-muted);
		opacity: 0.6;
		margin-left: auto;
	}

	.sep {
		height: 1px;
		background: var(--color-border-subtle);
		margin: 0.15rem 0;
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

	.btn-reset {
		border-color: var(--color-border-subtle);
		opacity: 0.6;
	}

	.callout {
		margin-top: 0.75rem;
		font-size: 0.68rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		border-left: 2px solid #e06c75;
		padding-left: 0.75rem;
	}

	.fade-in {
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
