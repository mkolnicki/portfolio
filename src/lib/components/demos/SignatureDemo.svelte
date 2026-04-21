<script lang="ts">
	function fakeHash(str: string): string {
		const segments: string[] = [];
		for (let s = 0; s < 4; s++) {
			let h = (0xdeadbeef + s * 0x9e3779b9) >>> 0;
			for (let i = 0; i < str.length; i++) {
				h = Math.imul(h ^ (str.charCodeAt(i) + s), 0x9e3779b9);
				h = ((h << 13) | (h >>> 19)) >>> 0;
				h = Math.imul(h, 0x85ebca6b) >>> 0;
				h ^= h >>> 16;
			}
			segments.push((h >>> 0).toString(16).padStart(8, '0'));
		}
		return segments.join('');
	}

	// Simulated RSA sign: XOR hash with a fixed "private key" mask for display
	const PRIV_MASK = 'a3f7c2d1b8e4f091a3f7c2d1b8e4f091';
	function fakeSign(hash: string): string {
		return hash
			.split('')
			.map((c, i) => {
				const h = parseInt(c, 16);
				const k = parseInt(PRIV_MASK[i % PRIV_MASK.length], 16);
				return (h ^ k).toString(16);
			})
			.join('');
	}

	const ORIGINAL = 'Transfer $1,000 to account 4892';
	const TAMPERED = 'Transfer $9,000 to account 4892';

	const originalHash = fakeHash(ORIGINAL);
	const signature = fakeSign(originalHash);
	// "decrypted" signature = XOR back (same operation reverses it)
	const signatureHash = fakeSign(signature); // = originalHash

	let tampered = $state(false);

	let receivedMsg = $derived(tampered ? TAMPERED : ORIGINAL);
	let receivedHash = $derived(fakeHash(receivedMsg));
	let verified = $derived(receivedHash === signatureHash);

	function diff(
		a: string,
		b: string
	): { char: string; different: boolean }[] {
		return a.split('').map((c, i) => ({ char: c, different: c !== b[i] }));
	}
</script>

<div class="demo">
	<header class="demo-label">DIGITAL SIGNATURE · SIGN & VERIFY</header>

	<div class="columns">
		<div class="col">
			<div class="col-title accent">ALICE SIGNS</div>

			<div class="field">
				<div class="field-lbl">MESSAGE</div>
				<div class="field-val message">{ORIGINAL}</div>
			</div>

			<div class="field">
				<div class="field-lbl">HASH</div>
				<div class="field-val hash muted">{originalHash}</div>
			</div>

			<div class="field">
				<div class="field-lbl">SIGNATURE</div>
				<div class="field-val sig yellow">
					{signature}
					<div class="sig-note">hash encrypted with Alice's private key</div>
				</div>
			</div>
		</div>

		<div class="divider-col">→</div>

		<div class="col">
			<div class="col-title {verified ? 'green' : 'red'}">
				BOB VERIFIES
			</div>

			<div class="field">
				<div class="field-lbl">
					RECEIVED MESSAGE
					<button class="tamper-btn {tampered ? 'active' : ''}" onclick={() => (tampered = !tampered)}>
						{tampered ? 'RESTORE' : 'TAMPER'}
					</button>
				</div>
				<div class="field-val message {tampered ? 'red' : ''}">
					{receivedMsg}
				</div>
			</div>

			<div class="field">
				<div class="field-lbl">RECOMPUTED HASH</div>
				<div class="field-val hash">
					{#each diff(receivedHash, signatureHash) as seg, i (i)}
						<span class="{seg.different ? 'red' : 'muted'}">{seg.char}</span>
					{/each}
				</div>
			</div>

			<div class="field">
				<div class="field-lbl">SIGNATURE HASH</div>
				<div class="field-val hash muted">{signatureHash}</div>
			</div>

			<div class="result {verified ? 'ok' : 'fail'}">
				{#if verified}
					VERIFIED — hashes match ✓
				{:else}
					SIGNATURE INVALID — hash mismatch ✗
				{/if}
			</div>
		</div>
	</div>

	<div class="callout">
		The signature commits Alice to the exact message content. Any change — even a single
		character — produces a completely different hash. The signature cannot be made to
		match the altered message without Alice's private key.
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

	.columns {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 0.75rem;
		align-items: start;
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.col-title {
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		margin-bottom: 0.1rem;
	}

	.accent { color: var(--color-accent); }
	.yellow { color: #e5c07b; }
	.green { color: #98c379; }
	.red { color: #e06c75; }
	.muted { color: var(--color-text-muted); }

	.divider-col {
		color: var(--color-text-muted);
		opacity: 0.3;
		font-size: 1rem;
		padding-top: 1.5rem;
		align-self: center;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.field-lbl {
		font-size: 0.52rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		opacity: 0.6;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.field-val {
		font-size: 0.65rem;
		line-height: 1.5;
		word-break: break-all;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.35rem 0.5rem;
	}

	.message {
		font-size: 0.68rem;
		color: var(--color-text);
	}

	.hash {
		font-size: 0.58rem;
		letter-spacing: 0.02em;
	}

	.sig {
		font-size: 0.58rem;
		letter-spacing: 0.02em;
	}

	.sig-note {
		font-size: 0.52rem;
		color: var(--color-text-muted);
		opacity: 0.5;
		margin-top: 0.25rem;
		letter-spacing: 0.04em;
	}

	.tamper-btn {
		font-family: var(--font-mono);
		font-size: 0.5rem;
		letter-spacing: 0.08em;
		padding: 0.1rem 0.35rem;
		background: transparent;
		border: 1px solid var(--color-border-subtle);
		border-radius: 2px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	.tamper-btn:hover {
		border-color: #e06c75;
		color: #e06c75;
	}

	.tamper-btn.active {
		border-color: #e06c75;
		color: #e06c75;
	}

	.result {
		font-size: 0.65rem;
		padding: 0.35rem 0.6rem;
		border-radius: var(--radius-sm);
		border-left: 2px solid;
		letter-spacing: 0.04em;
	}

	.result.ok {
		color: #98c379;
		border-color: #98c379;
		background: rgba(152, 195, 121, 0.06);
	}

	.result.fail {
		color: #e06c75;
		border-color: #e06c75;
		background: rgba(224, 108, 117, 0.06);
	}

	.callout {
		margin-top: 0.85rem;
		font-size: 0.68rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		opacity: 0.8;
	}

	@media (max-width: 560px) {
		.columns {
			grid-template-columns: 1fr;
		}

		.divider-col { display: none; }
	}
</style>
