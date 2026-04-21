<script lang="ts">
	const BASE = 'ATTACK AT DAWN';

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

	const BASE_HASH = hash(BASE);

	let input = $state(BASE);
	let currentHash = $derived(hash(input));

	let changed = $derived(
		currentHash.split('').filter((c, i) => c !== BASE_HASH[i]).length
	);

	let pct = $derived(Math.round((changed / BASE_HASH.length) * 100));

	function diff(
		a: string,
		b: string
	): { char: string; different: boolean }[] {
		return a.split('').map((c, i) => ({ char: c, different: c !== b[i] }));
	}
</script>

<div class="demo">
	<header class="demo-label">HASH · AVALANCHE EFFECT</header>

	<div class="panel">
		<div class="row">
			<span class="lbl">BASE</span>
			<span class="message base-msg">{BASE}</span>
		</div>
		<div class="row hash-row">
			<span class="lbl">HASH</span>
			<span class="hash base-hash">{BASE_HASH}</span>
		</div>

		<div class="sep"></div>

		<div class="row input-row">
			<span class="lbl">INPUT</span>
			<input
				class="msg-input"
				bind:value={input}
				maxlength={60}
				spellcheck={false}
				autocomplete="off"
			/>
		</div>
		<div class="row hash-row">
			<span class="lbl">HASH</span>
			<span class="hash">
				{#each diff(currentHash, BASE_HASH) as seg, i (i)}
					<span class="{seg.different ? 'bit-changed' : ''}">{seg.char}</span>
				{/each}
			</span>
		</div>
	</div>

	<div class="footer">
		<div class="meter">
			<div class="meter-bar" style:width="{pct}%"></div>
		</div>
		<div class="pct-label">
			{#if input === BASE}
				identical input — identical hash
			{:else}
				<span class="changed-count">{pct}%</span> of output bits changed
			{/if}
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

	.panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.row {
		display: flex;
		gap: 0.75rem;
		align-items: baseline;
	}

	.hash-row { align-items: start; }
	.input-row { align-items: center; }

	.lbl {
		font-size: 0.58rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		min-width: 3rem;
		flex-shrink: 0;
	}

	.message {
		font-size: 0.82rem;
		color: var(--color-text);
	}

	.base-msg {
		opacity: 0.5;
	}

	.hash {
		font-size: 0.62rem;
		color: var(--color-text-muted);
		word-break: break-all;
		line-height: 1.7;
	}

	.base-hash {
		opacity: 0.4;
	}

	.bit-changed {
		color: #e06c75;
	}

	.msg-input {
		flex: 1;
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
		font-family: var(--font-mono);
		font-size: 0.82rem;
		padding: 0.15rem 0;
		outline: none;
		transition: border-color var(--transition-fast);
	}

	.msg-input:focus {
		border-bottom-color: var(--color-accent);
	}

	.sep {
		height: 1px;
		background: var(--color-border-subtle);
		margin: 0.1rem 0;
	}

	.footer {
		margin-top: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.meter {
		height: 2px;
		background: var(--color-border-subtle);
		border-radius: 1px;
		overflow: hidden;
	}

	.meter-bar {
		height: 100%;
		background: #e06c75;
		border-radius: 1px;
		transition: width 0.15s ease;
	}

	.pct-label {
		font-size: 0.62rem;
		color: var(--color-text-muted);
	}

	.changed-count {
		color: #e06c75;
	}
</style>
