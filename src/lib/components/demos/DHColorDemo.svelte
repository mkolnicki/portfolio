<script lang="ts">
	type RGB = [number, number, number];

	function mix(...colors: RGB[]): RGB {
		return [
			Math.round(colors.reduce((s, c) => s + c[0], 0) / colors.length),
			Math.round(colors.reduce((s, c) => s + c[1], 0) / colors.length),
			Math.round(colors.reduce((s, c) => s + c[2], 0) / colors.length)
		];
	}

	function toCSS([r, g, b]: RGB): string {
		return `rgb(${r},${g},${b})`;
	}

	const BASE: RGB = [225, 195, 50]; // shared yellow

	const SECRETS: { name: string; color: RGB }[] = [
		{ name: 'coral', color: [210, 70, 75] },
		{ name: 'teal', color: [50, 155, 145] },
		{ name: 'indigo', color: [85, 85, 200] },
		{ name: 'sienna', color: [200, 110, 45] }
	];

	let aliceIdx = $state(0);
	let bobIdx = $state(2);

	let aliceSecret = $derived(SECRETS[aliceIdx].color);
	let bobSecret = $derived(SECRETS[bobIdx].color);

	let alicePublic = $derived(mix(BASE, aliceSecret));
	let bobPublic = $derived(mix(BASE, bobSecret));

	let aliceFinal = $derived(mix(BASE, aliceSecret, bobSecret));
	let bobFinal = $derived(mix(BASE, bobSecret, aliceSecret));

	let secretsMatch = $derived(
		aliceFinal[0] === bobFinal[0] &&
		aliceFinal[1] === bobFinal[1] &&
		aliceFinal[2] === bobFinal[2]
	);
</script>

<div class="demo">
	<header class="demo-label">DIFFIE-HELLMAN · PAINT MIXING ANALOGY</header>

	<div class="shared-row">
		<span class="row-lbl">SHARED BASE</span>
		<div class="swatch" style:background={toCSS(BASE)}></div>
		<span class="row-note">public — visible to everyone</span>
	</div>

	<div class="sep"></div>

	<div class="parties">
		<div class="party alice">
			<div class="party-name accent">ALICE</div>

			<div class="field-label">choose secret color</div>
			<div class="choices">
				{#each SECRETS as s, i (i)}
					<button
						class="choice-swatch {aliceIdx === i ? 'selected' : ''}"
						style:background={toCSS(s.color)}
						onclick={() => (aliceIdx = i)}
						title={s.name}
					></button>
				{/each}
			</div>

			<div class="field-label mt">public mix (base + secret)</div>
			<div class="mix-row">
				<div class="swatch sm" style:background={toCSS(BASE)}></div>
				<span class="plus">+</span>
				<div class="swatch sm secret-hidden"></div>
				<span class="plus">=</span>
				<div class="swatch sm" style:background={toCSS(alicePublic)}></div>
			</div>
			<div class="sends">sends →</div>
		</div>

		<div class="eve-col">
			<div class="eve-label">EVE OBSERVES</div>
			<div class="eve-items">
				<div class="eve-item">
					<div class="swatch sm" style:background={toCSS(BASE)}></div>
					<span class="eve-name">base</span>
				</div>
				<div class="eve-item">
					<div class="swatch sm" style:background={toCSS(alicePublic)}></div>
					<span class="eve-name">Alice's mix</span>
				</div>
				<div class="eve-item">
					<div class="swatch sm" style:background={toCSS(bobPublic)}></div>
					<span class="eve-name">Bob's mix</span>
				</div>
			</div>
			<div class="cannot-unmix">cannot un-mix</div>
		</div>

		<div class="party bob">
			<div class="party-name yellow">BOB</div>

			<div class="field-label">choose secret color</div>
			<div class="choices">
				{#each SECRETS as s, i (i)}
					<button
						class="choice-swatch {bobIdx === i ? 'selected' : ''}"
						style:background={toCSS(s.color)}
						onclick={() => (bobIdx = i)}
						title={s.name}
					></button>
				{/each}
			</div>

			<div class="field-label mt">public mix (base + secret)</div>
			<div class="mix-row">
				<div class="swatch sm" style:background={toCSS(BASE)}></div>
				<span class="plus">+</span>
				<div class="swatch sm secret-hidden"></div>
				<span class="plus">=</span>
				<div class="swatch sm" style:background={toCSS(bobPublic)}></div>
			</div>
			<div class="sends">← sends</div>
		</div>
	</div>

	<div class="sep"></div>

	<div class="final-row">
		<div class="final-party">
			<div class="final-calc">
				<div class="swatch sm" style:background={toCSS(bobPublic)}></div>
				<span class="plus">+</span>
				<div class="swatch sm secret-hidden"></div>
				<span class="plus">=</span>
				<div class="swatch final-swatch" style:background={toCSS(aliceFinal)}></div>
			</div>
			<div class="final-lbl accent">Alice's shared secret</div>
		</div>

		{#if secretsMatch}
			<div class="match-badge">= same</div>
		{/if}

		<div class="final-party">
			<div class="final-calc">
				<div class="swatch sm" style:background={toCSS(alicePublic)}></div>
				<span class="plus">+</span>
				<div class="swatch sm secret-hidden"></div>
				<span class="plus">=</span>
				<div class="swatch final-swatch" style:background={toCSS(bobFinal)}></div>
			</div>
			<div class="final-lbl yellow">Bob's shared secret</div>
		</div>
	</div>

	<div class="callout">
		Both parties arrive at the same color — base + Alice's secret + Bob's secret — without
		ever transmitting it. Eve sees the public mixes but cannot reconstruct the final blend.
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

	.shared-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.5rem;
	}

	.row-lbl {
		font-size: 0.58rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		min-width: 6.5rem;
	}

	.row-note {
		font-size: 0.58rem;
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.sep {
		height: 1px;
		background: var(--color-border-subtle);
		margin: 0.75rem 0;
	}

	.parties {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 1rem;
		align-items: start;
	}

	.party {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.party-name {
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		margin-bottom: 0.1rem;
	}

	.accent { color: var(--color-accent); }
	.yellow { color: #e5c07b; }

	.field-label {
		font-size: 0.55rem;
		color: var(--color-text-muted);
		opacity: 0.6;
		letter-spacing: 0.06em;
	}

	.field-label.mt { margin-top: 0.3rem; }

	.choices {
		display: flex;
		gap: 0.35rem;
	}

	.choice-swatch {
		width: 1.3rem;
		height: 1.3rem;
		border-radius: 3px;
		border: 2px solid transparent;
		cursor: pointer;
		transition: border-color 0.15s ease, transform 0.1s ease;
		padding: 0;
	}

	.choice-swatch:hover {
		transform: scale(1.1);
	}

	.choice-swatch.selected {
		border-color: var(--color-text);
		transform: scale(1.1);
	}

	.mix-row {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.plus {
		font-size: 0.62rem;
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.swatch {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 3px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		flex-shrink: 0;
	}

	.swatch.sm {
		width: 1.2rem;
		height: 1.2rem;
	}

	.secret-hidden {
		background: repeating-linear-gradient(
			45deg,
			rgba(255,255,255,0.05) 0px,
			rgba(255,255,255,0.05) 3px,
			transparent 3px,
			transparent 7px
		);
		border: 1px dashed var(--color-border);
	}

	.sends {
		font-size: 0.55rem;
		color: var(--color-text-muted);
		opacity: 0.5;
		letter-spacing: 0.06em;
	}

	.eve-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border: 1px dashed var(--color-border-subtle);
		border-radius: var(--radius-sm);
	}

	.eve-label {
		font-size: 0.52rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		opacity: 0.6;
	}

	.eve-items {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.eve-item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.eve-name {
		font-size: 0.52rem;
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.cannot-unmix {
		font-size: 0.5rem;
		color: #e06c75;
		opacity: 0.7;
		letter-spacing: 0.06em;
		text-align: center;
	}

	.final-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.final-party {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}

	.final-calc {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.final-swatch {
		width: 2rem;
		height: 2rem;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	.final-lbl {
		font-size: 0.55rem;
		letter-spacing: 0.08em;
	}

	.match-badge {
		font-size: 0.65rem;
		color: #98c379;
		letter-spacing: 0.1em;
		align-self: center;
	}

	.callout {
		margin-top: 0.75rem;
		font-size: 0.68rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		opacity: 0.8;
	}

	@media (max-width: 560px) {
		.parties {
			grid-template-columns: 1fr;
		}

		.eve-col {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
		}

		.eve-items { flex-direction: row; }
	}
</style>
