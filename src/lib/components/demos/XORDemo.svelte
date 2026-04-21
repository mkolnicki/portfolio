<script lang="ts">
	const KEY = [1, 0, 1, 1, 0, 1, 0, 0];

	let msg = $state([0, 1, 0, 0, 0, 0, 0, 1]);

	let cipher = $derived(msg.map((b, i) => b ^ KEY[i]));
	let decrypted = $derived(cipher.map((b, i) => b ^ KEY[i]));

	function toggle(i: number) {
		const next = [...msg];
		next[i] = 1 - next[i];
		msg = next;
	}

	function toHex(bits: number[]): string {
		return '0x' + parseInt(bits.join(''), 2).toString(16).toUpperCase().padStart(2, '0');
	}
</script>

<div class="demo">
	<header class="demo-label">XOR · THE REVERSIBLE OPERATION</header>

	<div class="table">
		<div class="row-wrap">
			<div class="row-label">MESSAGE</div>
			<div class="bits">
				{#each msg as bit, i}
					<button class="bit msg-bit" onclick={() => toggle(i)}>{bit}</button>
				{/each}
			</div>
			<div class="hex">{toHex(msg)}</div>
		</div>

		<div class="row-wrap op-wrap">
			<div class="row-label op-label">⊕ KEY</div>
			<div class="bits">
				{#each KEY as bit}
					<div class="bit key-bit">{bit}</div>
				{/each}
			</div>
			<div class="hex key-hex">{toHex(KEY)}</div>
		</div>

		<div class="divider"></div>

		<div class="row-wrap">
			<div class="row-label cipher-label">CIPHER</div>
			<div class="bits">
				{#each cipher as bit}
					<div class="bit cipher-bit">{bit}</div>
				{/each}
			</div>
			<div class="hex cipher-hex">{toHex(cipher)}</div>
		</div>

		<div class="gap"></div>

		<div class="row-wrap op-wrap">
			<div class="row-label op-label">⊕ KEY</div>
			<div class="bits">
				{#each KEY as bit}
					<div class="bit key-bit">{bit}</div>
				{/each}
			</div>
			<div class="hex key-hex">{toHex(KEY)}</div>
		</div>

		<div class="divider"></div>

		<div class="row-wrap">
			<div class="row-label decrypt-label">DECRYPTED</div>
			<div class="bits">
				{#each decrypted as bit, i}
					<div class="bit decrypt-bit {bit === msg[i] ? 'match' : ''}">{bit}</div>
				{/each}
			</div>
			<div class="hex decrypt-hex">{toHex(decrypted)}</div>
		</div>
	</div>

	<div class="callout">
		Click any <span class="msg-highlight">MESSAGE</span> bit to flip it —
		DECRYPTED always equals MESSAGE. The key is its own inverse.
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

	.table {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.row-wrap {
		display: grid;
		grid-template-columns: 5.5rem 1fr auto;
		align-items: center;
		gap: 0.6rem;
	}

	.op-wrap { opacity: 0.75; }
	.gap { height: 0.4rem; }

	.row-label {
		font-size: 0.6rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.op-label { font-size: 0.55rem; }
	.cipher-label { color: #e06c75; }
	.decrypt-label { color: var(--color-accent); }

	.bits {
		display: flex;
		gap: 0.2rem;
	}

	.bit {
		width: 1.35rem;
		height: 1.35rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.72rem;
		border-radius: 3px;
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface);
		color: var(--color-text-muted);
		transition: all 0.1s ease;
		user-select: none;
	}

	button.bit {
		cursor: pointer;
		color: var(--color-text);
		border-color: var(--color-border);
	}

	button.bit:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.key-bit {
		color: #e5c07b;
		border-color: rgba(229, 192, 123, 0.25);
	}

	.cipher-bit {
		color: #e06c75;
		border-color: rgba(224, 108, 117, 0.25);
	}

	.decrypt-bit {
		color: var(--color-text-muted);
		border-color: var(--color-border-subtle);
	}

	.decrypt-bit.match {
		color: var(--color-accent);
		border-color: rgba(var(--color-accent-rgb, 97, 175, 239), 0.3);
	}

	.hex {
		font-size: 0.62rem;
		color: var(--color-text-muted);
		text-align: right;
		min-width: 2.8rem;
	}

	.key-hex { color: rgba(229, 192, 123, 0.7); }
	.cipher-hex { color: rgba(224, 108, 117, 0.7); }
	.decrypt-hex { color: var(--color-accent); opacity: 0.7; }

	.divider {
		height: 1px;
		background: var(--color-border-subtle);
		margin: 0.1rem 0;
	}

	.callout {
		margin-top: 1rem;
		font-size: 0.7rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.msg-highlight {
		color: var(--color-text);
	}

	@media (max-width: 520px) {
		.bit { width: 1.1rem; height: 1.1rem; font-size: 0.62rem; }
		.bits { gap: 0.15rem; }
	}
</style>
