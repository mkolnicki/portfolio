<script lang="ts">
	function extgcd(a: number, b: number): [number, number, number] {
		if (b === 0) return [a, 1, 0];
		const [g, x, y] = extgcd(b, a % b);
		return [g, y, x - Math.floor(a / b) * y];
	}

	function modInverse(a: number, m: number): number {
		const [, x] = extgcd(((a % m) + m) % m, m);
		return ((x % m) + m) % m;
	}

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

	function gcd(a: number, b: number): number {
		while (b) [a, b] = [b, a % b];
		return a;
	}

	function pickE(phi: number): number {
		for (const e of [3, 5, 7, 11, 13, 17]) {
			if (e < phi && gcd(e, phi) === 1) return e;
		}
		return 3;
	}

	const PAIRS = [
		{ p: 7, q: 11 },
		{ p: 11, q: 13 },
		{ p: 17, q: 19 },
		{ p: 13, q: 23 }
	];

	let pairIdx = $state(0);
	let msgInput = $state('42');
	let mode = $state<'keys' | 'use'>('keys');

	let p = $derived(PAIRS[pairIdx].p);
	let q = $derived(PAIRS[pairIdx].q);
	let n = $derived(p * q);
	let phi = $derived((p - 1) * (q - 1));
	let e = $derived(pickE(phi));
	let d = $derived(modInverse(e, phi));
	let checkVal = $derived((e * d) % phi);

	let M = $derived.by(() => {
		const v = parseInt(msgInput);
		return !isNaN(v) && v >= 2 && v < n ? v : null;
	});
	let C = $derived(M != null ? modpow(M, e, n) : null);
	let M2 = $derived(C != null ? modpow(C, d, n) : null);
	let verified = $derived(M != null && M === M2);
</script>

<div class="demo">
	<header class="demo-label">RSA · KEY CONSTRUCTION & ENCRYPTION</header>

	<div class="pair-select">
		{#each PAIRS as pair, i (i)}
			<button class="pair-btn {pairIdx === i ? 'active' : ''}" onclick={() => (pairIdx = i)}>
				p={pair.p}, q={pair.q}
			</button>
		{/each}
	</div>

	<div class="tabs">
		<button class="tab {mode === 'keys' ? 'active' : ''}" onclick={() => (mode = 'keys')}>
			KEY GENERATION
		</button>
		<button class="tab {mode === 'use' ? 'active' : ''}" onclick={() => (mode = 'use')}>
			ENCRYPT / DECRYPT
		</button>
	</div>

	{#if mode === 'keys'}
		<div class="key-panel">
			<div class="krow">
				<span class="klbl">p</span>
				<span class="kval accent">{p}</span>
				<span class="kcomment">— first prime (secret)</span>
			</div>
			<div class="krow">
				<span class="klbl">q</span>
				<span class="kval accent">{q}</span>
				<span class="kcomment">— second prime (secret)</span>
			</div>

			<div class="ksep"></div>

			<div class="krow">
				<span class="klbl">n</span>
				<span class="kval"
					>= {p} × {q} = <span class="accent">{n}</span></span
				>
				<span class="kcomment">— modulus (public)</span>
			</div>
			<div class="krow">
				<span class="klbl">φ(n)</span>
				<span class="kval"
					>= {p - 1} × {q - 1} = <span class="accent">{phi}</span></span
				>
				<span class="kcomment">— Euler's totient (secret)</span>
			</div>

			<div class="ksep"></div>

			<div class="krow">
				<span class="klbl">e</span>
				<span class="kval pub">{e}</span>
				<span class="kcomment">— public exponent · gcd(e, φ) = {gcd(e, phi)}</span>
			</div>
			<div class="krow">
				<span class="klbl">d</span>
				<span class="kval priv">{d}</span>
				<span class="kcomment">— private exponent · e×d ≡ {checkVal} mod φ</span>
			</div>

			<div class="ksep"></div>

			<div class="key-summary">
				<div class="key-box">
					<span class="key-tag pub-tag">PUBLIC KEY</span>
					<span class="key-content">(n={n}, e={e})</span>
				</div>
				<div class="key-box">
					<span class="key-tag priv-tag">PRIVATE KEY</span>
					<span class="key-content">d={d}</span>
				</div>
			</div>
		</div>
	{:else}
		<div class="use-panel">
			<div class="use-params">
				n={n} · e={e} (public) · d={d} (private)
			</div>

			<div class="msg-row">
				<span class="klbl">M =</span>
				<input
					class="msg-input"
					bind:value={msgInput}
					placeholder="2–{n - 1}"
					maxlength="4"
					spellcheck={false}
				/>
				{#if M == null}
					<span class="invalid">must be an integer from 2 to {n - 1}</span>
				{/if}
			</div>

			{#if M != null}
				<div class="eq-group">
					<div class="eq-row">
						<span class="eq-lbl yellow-lbl">ENCRYPT</span>
						<span class="eq-expr">
							C = M<sup>e</sup> mod n = {M}<sup>{e}</sup> mod {n} = <span class="yellow">{C}</span>
						</span>
					</div>
					<div class="eq-row">
						<span class="eq-lbl green-lbl">DECRYPT</span>
						<span class="eq-expr">
							M' = C<sup>d</sup> mod n = {C}<sup>{d}</sup> mod {n} = <span class="green">{M2}</span>
						</span>
					</div>
				</div>
				{#if verified}
					<div class="result ok">M = M' = {M} — round trip verified ✓</div>
				{/if}
			{/if}
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

	.pair-select {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
		margin-bottom: 0.75rem;
	}

	.pair-btn {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		letter-spacing: 0.08em;
		padding: 0.2rem 0.5rem;
		background: transparent;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	.pair-btn:hover {
		border-color: var(--color-border);
		color: var(--color-text);
	}

	.pair-btn.active {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.tabs {
		display: flex;
		gap: 0;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.tab {
		font-family: var(--font-mono);
		font-size: 0.58rem;
		letter-spacing: 0.1em;
		padding: 0.3rem 0.75rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast);
		margin-bottom: -1px;
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab.active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}

	.key-panel {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.krow {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.72rem;
	}

	.klbl {
		min-width: 2.5rem;
		color: var(--color-text-muted);
		font-size: 0.65rem;
		letter-spacing: 0.06em;
	}

	.kval {
		color: var(--color-text-muted);
	}

	.kcomment {
		color: var(--color-text-muted);
		opacity: 0.5;
		font-size: 0.6rem;
	}

	.accent {
		color: var(--color-accent);
	}

	.pub {
		color: #e5c07b;
	}

	.priv {
		color: #e06c75;
	}

	.ksep {
		height: 1px;
		background: var(--color-border-subtle);
		margin: 0.25rem 0;
	}

	.key-summary {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.25rem;
		flex-wrap: wrap;
	}

	.key-box {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.35rem 0.65rem;
	}

	.key-tag {
		font-size: 0.52rem;
		letter-spacing: 0.1em;
	}

	.pub-tag {
		color: #e5c07b;
	}
	.priv-tag {
		color: #e06c75;
	}

	.key-content {
		font-size: 0.68rem;
		color: var(--color-text);
	}

	.use-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.use-params {
		font-size: 0.6rem;
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.msg-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.msg-input {
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
		font-family: var(--font-mono);
		font-size: 0.78rem;
		padding: 0.1rem 0.25rem;
		outline: none;
		width: 4rem;
		transition: border-color var(--transition-fast);
	}

	.msg-input:focus {
		border-bottom-color: var(--color-accent);
	}

	.invalid {
		font-size: 0.6rem;
		color: #e06c75;
		opacity: 0.8;
	}

	.eq-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
	}

	.eq-row {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.eq-lbl {
		font-size: 0.55rem;
		letter-spacing: 0.1em;
		min-width: 4.5rem;
	}

	.yellow-lbl {
		color: #e5c07b;
	}
	.green-lbl {
		color: #98c379;
	}

	.eq-expr {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	.yellow {
		color: #e5c07b;
	}
	.green {
		color: #98c379;
	}

	.result {
		font-size: 0.65rem;
		padding: 0.3rem 0.6rem;
		border-radius: var(--radius-sm);
		border-left: 2px solid;
		padding-left: 0.6rem;
	}

	.result.ok {
		color: #98c379;
		border-color: #98c379;
		background: rgba(152, 195, 121, 0.06);
	}

	@media (max-width: 520px) {
		.eq-row {
			flex-direction: column;
			gap: 0.2rem;
		}
	}
</style>
