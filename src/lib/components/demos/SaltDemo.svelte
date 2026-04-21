<script lang="ts">
	const PASSWORD = 'hunter2';

	const SALTS: [string, string] = ['a3f9b2c1', 'd7e04b8f'];

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

	const UNSALTED_HASH = hash(PASSWORD);
	const SALTED_HASHES: [string, string] = [
		hash(SALTS[0] + PASSWORD),
		hash(SALTS[1] + PASSWORD)
	];

	let salted = $state(false);

	const users = ['ALICE', 'BOB'] as const;
</script>

<div class="demo">
	<header class="demo-label">SALTING · DEFEATING PRECOMPUTATION</header>

	<div class="users">
		{#each users as user, i}
			<div class="user-card">
				<div class="user-name">{user}</div>
				<div class="field">
					<span class="lbl">PASSWORD</span>
					<span class="val password">{PASSWORD}</span>
				</div>
				{#if salted}
					<div class="field fade-in">
						<span class="lbl">SALT</span>
						<span class="val salt">{SALTS[i]}</span>
					</div>
					<div class="field fade-in">
						<span class="lbl">INPUT</span>
						<span class="val input-val">{SALTS[i]}<span class="pw-append">+{PASSWORD}</span></span>
					</div>
				{/if}
				<div class="field">
					<span class="lbl">STORED HASH</span>
					<span class="val hash {salted ? 'hash-unique' : 'hash-same'}">
						{salted ? SALTED_HASHES[i] : UNSALTED_HASH}
					</span>
				</div>
				{#if !salted}
					<div class="match-badge">= SAME HASH</div>
				{/if}
			</div>
		{/each}
	</div>

	{#if !salted}
		<div class="warning">
			Identical passwords produce identical hashes. An attacker who cracks one cracks both — and
			precomputed lookup tables make it instant.
		</div>
	{:else}
		<div class="success fade-in">
			Same password, different salts, completely different hashes. Precomputed tables are useless —
			each hash must be attacked independently.
		</div>
	{/if}

	<div class="controls">
		<button class="btn" onclick={() => (salted = !salted)}>
			{salted ? 'REMOVE SALT' : 'ADD SALT'}
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

	.users {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.user-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.75rem 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.user-name {
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		color: var(--color-accent);
		margin-bottom: 0.1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.lbl {
		font-size: 0.52rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.val {
		font-size: 0.65rem;
		word-break: break-all;
		line-height: 1.5;
	}

	.password { color: var(--color-text); }
	.salt { color: #e5c07b; }

	.input-val {
		color: #e5c07b;
		font-size: 0.6rem;
	}

	.pw-append {
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.hash {
		font-size: 0.58rem;
		line-height: 1.6;
	}

	.hash-same {
		color: #e06c75;
	}

	.hash-unique {
		color: var(--color-accent);
	}

	.match-badge {
		font-size: 0.55rem;
		letter-spacing: 0.08em;
		color: #e06c75;
		opacity: 0.8;
	}

	.warning {
		margin-top: 0.75rem;
		font-size: 0.68rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		border-left: 2px solid #e06c75;
		padding-left: 0.75rem;
	}

	.success {
		margin-top: 0.75rem;
		font-size: 0.68rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		border-left: 2px solid var(--color-accent);
		padding-left: 0.75rem;
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

	.fade-in {
		animation: fadeIn 0.25s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(3px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@media (max-width: 480px) {
		.users { grid-template-columns: 1fr; }
	}
</style>
