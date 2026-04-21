<script lang="ts">
	function modpow(base: number, exp: number, mod: number): number {
		let result = 1;
		base = ((base % mod) + mod) % mod;
		while (exp > 0) {
			if (exp & 1) result = (result * base) % mod;
			base = (base * base) % mod;
			exp >>= 1;
		}
		return result;
	}

	const PARAMS = [
		{ g: 2, p: 23 },
		{ g: 5, p: 47 },
		{ g: 3, p: 53 }
	];

	let paramIdx = $state(0);
	let a = $state(6);
	let b = $state(15);

	let g = $derived(PARAMS[paramIdx].g);
	let p = $derived(PARAMS[paramIdx].p);

	let A = $derived(modpow(g, a, p));
	let B = $derived(modpow(g, b, p));

	let sharedAlice = $derived(modpow(B, a, p));
	let sharedBob = $derived(modpow(A, b, p));

	let match = $derived(sharedAlice === sharedBob);
</script>

<div class="demo">
	<header class="demo-label">DIFFIE-HELLMAN · KEY EXCHANGE</header>

	<div class="public-params">
		<span class="param-lbl">PUBLIC PARAMETERS</span>
		<div class="param-btns">
			{#each PARAMS as pr, i (i)}
				<button
					class="param-btn {paramIdx === i ? 'active' : ''}"
					onclick={() => (paramIdx = i)}
				>
					g={pr.g}, p={pr.p}
				</button>
			{/each}
		</div>
	</div>

	<div class="exchange">
		<div class="party">
			<div class="party-name accent">ALICE</div>

			<div class="secret-row">
				<span class="slbl">secret a =</span>
				<input
					type="range"
					min="2"
					max={p - 2}
					bind:value={a}
					class="slider"
				/>
				<span class="sval accent">{a}</span>
			</div>

			<div class="compute-block">
				<div class="compute-lbl">computes:</div>
				<div class="formula">
					A = g<sup>a</sup> mod p
				</div>
				<div class="formula-expanded">
					= {g}<sup>{a}</sup> mod {p}
				</div>
				<div class="formula-result">
					= <span class="accent">{A}</span>
				</div>
			</div>

			<div class="sends">sends A = {A} →</div>
		</div>

		<div class="middle">
			<div class="channel-label">public channel</div>
			<div class="arrow-up">↑ A = {A}</div>
			<div class="arrow-down">↓ B = {B}</div>
			<div class="channel-label">Eve watches</div>
		</div>

		<div class="party bob">
			<div class="party-name yellow">BOB</div>

			<div class="secret-row">
				<span class="slbl">secret b =</span>
				<input
					type="range"
					min="2"
					max={p - 2}
					bind:value={b}
					class="slider"
				/>
				<span class="sval yellow">{b}</span>
			</div>

			<div class="compute-block">
				<div class="compute-lbl">computes:</div>
				<div class="formula">
					B = g<sup>b</sup> mod p
				</div>
				<div class="formula-expanded">
					= {g}<sup>{b}</sup> mod {p}
				</div>
				<div class="formula-result">
					= <span class="yellow">{B}</span>
				</div>
			</div>

			<div class="sends">← sends B = {B}</div>
		</div>
	</div>

	<div class="sep"></div>

	<div class="shared-section">
		<div class="shared-party">
			<div class="shared-lbl accent">Alice computes:</div>
			<div class="shared-formula">
				S = B<sup>a</sup> mod p = {B}<sup>{a}</sup> mod {p} = <span class="secret">{sharedAlice}</span>
			</div>
		</div>

		<div class="shared-party">
			<div class="shared-lbl yellow">Bob computes:</div>
			<div class="shared-formula">
				S = A<sup>b</sup> mod p = {A}<sup>{b}</sup> mod {p} = <span class="secret">{sharedBob}</span>
			</div>
		</div>
	</div>

	{#if match}
		<div class="secret-banner">
			SHARED SECRET = {sharedAlice}
			<span class="verified">— g<sup>ab</sup> mod p, never transmitted ✓</span>
		</div>
	{/if}

	<div class="callout">
		Drag the sliders to change Alice's secret a and Bob's secret b. Eve sees g, p, A, and B —
		but recovering a from A = g<sup>a</sup> mod p requires solving the discrete logarithm problem.
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

	.public-params {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.param-lbl {
		font-size: 0.55rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		opacity: 0.6;
	}

	.param-btns {
		display: flex;
		gap: 0.35rem;
	}

	.param-btn {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		letter-spacing: 0.06em;
		padding: 0.15rem 0.45rem;
		background: transparent;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	.param-btn:hover { border-color: var(--color-border); color: var(--color-text); }
	.param-btn.active { border-color: var(--color-accent); color: var(--color-accent); }

	.exchange {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 0.75rem;
		align-items: start;
	}

	.party {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.party-name {
		font-size: 0.62rem;
		letter-spacing: 0.12em;
	}

	.accent { color: var(--color-accent); }
	.yellow { color: #e5c07b; }

	.secret-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.slbl {
		font-size: 0.6rem;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.slider {
		flex: 1;
		height: 2px;
		cursor: pointer;
		accent-color: var(--color-accent);
		min-width: 0;
	}

	.sval {
		font-size: 0.72rem;
		min-width: 1.5rem;
		text-align: right;
	}

	.compute-block {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.6rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.compute-lbl {
		font-size: 0.52rem;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		opacity: 0.5;
		margin-bottom: 0.1rem;
	}

	.formula {
		font-size: 0.68rem;
		color: var(--color-text-muted);
	}

	.formula-expanded {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.formula-result {
		font-size: 0.72rem;
		color: var(--color-text-muted);
		margin-top: 0.1rem;
	}

	.sends {
		font-size: 0.58rem;
		color: var(--color-text-muted);
		opacity: 0.6;
		letter-spacing: 0.04em;
	}

	.middle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		padding-top: 1.5rem;
	}

	.channel-label {
		font-size: 0.5rem;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		opacity: 0.4;
		text-align: center;
	}

	.arrow-up,
	.arrow-down {
		font-size: 0.58rem;
		color: var(--color-text-muted);
		opacity: 0.5;
		white-space: nowrap;
	}

	.sep {
		height: 1px;
		background: var(--color-border-subtle);
		margin: 0.75rem 0;
	}

	.shared-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.shared-party {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.6rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.shared-lbl {
		font-size: 0.55rem;
		letter-spacing: 0.08em;
	}

	.shared-formula {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	.secret {
		color: #98c379;
	}

	.secret-banner {
		margin-top: 0.6rem;
		font-size: 0.7rem;
		color: #98c379;
		padding: 0.4rem 0.75rem;
		border: 1px solid rgba(152, 195, 121, 0.25);
		border-radius: var(--radius-sm);
		background: rgba(152, 195, 121, 0.06);
	}

	.verified {
		color: var(--color-text-muted);
		opacity: 0.6;
		font-size: 0.62rem;
	}

	.callout {
		margin-top: 0.75rem;
		font-size: 0.68rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		opacity: 0.8;
	}

	@media (max-width: 560px) {
		.exchange {
			grid-template-columns: 1fr;
		}

		.middle {
			flex-direction: row;
			padding-top: 0;
			flex-wrap: wrap;
			justify-content: center;
		}

		.shared-section {
			grid-template-columns: 1fr;
		}
	}
</style>
