<script lang="ts">
	const ORIGINAL = 'ATTACK AT DAWN';
	const TAMPERED = 'ATTACK AT DUSK';

	function hash(str: string): string {
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

	const HASH_OK = hash(ORIGINAL);
	const HASH_BAD = hash(TAMPERED);

	let tampered = $state(false);

	let message = $derived(tampered ? TAMPERED : ORIGINAL);
	let currentHash = $derived(tampered ? HASH_BAD : HASH_OK);
	let valid = $derived(!tampered);

	function diffChars(a: string, b: string): { char: string; changed: boolean }[] {
		return a.split('').map((c, i) => ({ char: c, changed: c !== b[i] }));
	}

	let hashDiff = $derived(diffChars(currentHash, tampered ? HASH_OK : HASH_BAD));
</script>

<div class="demo">
	<header class="demo-label">INTEGRITY</header>

	<div class="panel">
		<div class="row">
			<span class="field-label">MESSAGE</span>
			<span class="message">
				{#each diffChars(message, tampered ? ORIGINAL : TAMPERED) as seg, i (i)}
					<span class="{seg.changed ? 'changed' : ''}">{seg.char}</span>
				{/each}
			</span>
		</div>

		<div class="row hash-row">
			<span class="field-label">HASH</span>
			<span class="hash">
				{#each hashDiff as seg, i (i)}
					<span class="{seg.changed ? 'hash-changed' : ''}">{seg.char}</span>
				{/each}
			</span>
		</div>

		<div class="footer">
			<div class="status {valid ? 'ok' : 'bad'}">
				{valid ? '✓ VERIFIED' : '✗ TAMPERED'}
			</div>
			<button class="btn" onclick={() => (tampered = !tampered)}>
				{tampered ? 'RESTORE' : 'TAMPER'}
			</button>
		</div>
	</div>

	{#if tampered}
		<div class="callout">
			Three characters changed: <span class="changed-word">DAWN → DUSK</span>. The hash is unrecognisable.
		</div>
	{/if}
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

	.panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.row {
		display: flex;
		gap: 0.75rem;
		align-items: baseline;
		flex-wrap: wrap;
	}

	.hash-row { align-items: start; }

	.field-label {
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		color: var(--color-text-muted);
		min-width: 4.5rem;
		flex-shrink: 0;
	}

	.message {
		font-size: 0.85rem;
		color: var(--color-text);
		letter-spacing: 0.05em;
	}

	.hash {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		word-break: break-all;
		line-height: 1.6;
	}

	.changed {
		color: #e06c75;
		background: rgba(224, 108, 117, 0.15);
		border-radius: 2px;
	}

	.hash-changed {
		color: #e06c75;
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 0.5rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	.status {
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		font-weight: 600;
	}

	.status.ok { color: var(--color-accent); }
	.status.bad { color: #e06c75; }

	.btn {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		padding: 0.3rem 0.75rem;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: border-color var(--transition-fast), color var(--transition-fast);
	}

	.btn:hover {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	.callout {
		margin-top: 0.75rem;
		font-size: 0.7rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.changed-word {
		color: #e06c75;
	}
</style>
