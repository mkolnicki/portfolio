<script lang="ts">
	type VerifyStep = { id: number; label: string; detail: string; ok: boolean };

	const CERTS = [
		{
			level: 'ROOT CA',
			subject: 'DigiTrust Root CA',
			issuer: 'DigiTrust Root CA',
			selfSigned: true,
			valid: '2024-01-01 – 2034-01-01',
			key: 'RSA 4096',
			fingerprint: 'a3:b9:2f:c1:d8:e4:f7:01:a3:b9:2f:c1:d8:e4:f7:01',
			note: 'Self-signed. Trusted because it is pre-installed in your OS/browser.'
		},
		{
			level: 'INTERMEDIATE CA',
			subject: 'DigiTrust Web CA G3',
			issuer: 'DigiTrust Root CA',
			selfSigned: false,
			valid: '2024-06-01 – 2027-06-01',
			key: 'RSA 2048',
			fingerprint: '7e:c2:90:5a:1f:b3:d6:08:7e:c2:90:5a:1f:b3:d6:08',
			note: 'Signed by Root CA. Root private key stays offline — intermediates handle day-to-day issuance.'
		},
		{
			level: 'LEAF CERTIFICATE',
			subject: 'example.com',
			issuer: 'DigiTrust Web CA G3',
			selfSigned: false,
			valid: '2026-01-15 – 2027-01-15',
			key: 'ECDSA P-256',
			fingerprint: '3c:f8:a1:04:9d:e7:2b:55:3c:f8:a1:04:9d:e7:2b:55',
			note: 'Signed by Intermediate CA. Covers example.com and www.example.com (SAN extension).'
		}
	];

	const STEPS: VerifyStep[] = [
		{
			id: 0,
			label: 'Leaf signature check',
			detail: 'example.com cert — verify signature using DigiTrust Web CA G3 public key',
			ok: true
		},
		{
			id: 1,
			label: 'Intermediate signature check',
			detail: 'DigiTrust Web CA G3 cert — verify signature using DigiTrust Root CA public key',
			ok: true
		},
		{
			id: 2,
			label: 'Root trust check',
			detail: 'DigiTrust Root CA — found in browser trust store (pre-installed)',
			ok: true
		}
	];

	let selected = $state(0);
	let verifyStep = $state(-1);
	let verifying = $state(false);

	async function runVerify() {
		verifying = true;
		verifyStep = -1;
		for (let i = 0; i < STEPS.length; i++) {
			await new Promise((r) => setTimeout(r, 600));
			verifyStep = i;
		}
		verifying = false;
	}

	function reset() {
		verifyStep = -1;
	}
</script>

<div class="demo">
	<header class="demo-label">PKI · CERTIFICATE CHAIN</header>

	<div class="chain">
		{#each CERTS as cert, i (i)}
			<button
				class="cert-card {selected === i ? 'selected' : ''}"
				onclick={() => (selected = i)}
			>
				<div class="cert-level {i === 0 ? 'root' : i === 1 ? 'inter' : 'leaf'}">{cert.level}</div>
				<div class="cert-subject">{cert.subject}</div>
				{#if cert.selfSigned}
					<div class="cert-badge">self-signed</div>
				{:else}
					<div class="cert-signed-by">signed by {cert.issuer}</div>
				{/if}
			</button>
			{#if i < CERTS.length - 1}
				<div class="chain-arrow">↑ signs</div>
			{/if}
		{/each}
	</div>

	<div class="detail-panel">
		<div class="detail-title">{CERTS[selected].level} — {CERTS[selected].subject}</div>
		<div class="detail-grid">
			<span class="dl">SUBJECT</span>
			<span class="dv">{CERTS[selected].subject}</span>
			<span class="dl">ISSUER</span>
			<span class="dv">{CERTS[selected].issuer}</span>
			<span class="dl">VALID</span>
			<span class="dv">{CERTS[selected].valid}</span>
			<span class="dl">KEY</span>
			<span class="dv">{CERTS[selected].key}</span>
			<span class="dl">FINGERPRINT</span>
			<span class="dv fp">{CERTS[selected].fingerprint}</span>
		</div>
		<div class="detail-note">{CERTS[selected].note}</div>
	</div>

	<div class="sep"></div>

	<div class="verify-section">
		<div class="verify-title">CHAIN VERIFICATION</div>

		<div class="steps">
			{#each STEPS as step (step.id)}
				<div
					class="step {verifyStep >= step.id ? 'done' : ''} {verifyStep === step.id ? 'current' : ''}"
				>
					<span class="step-icon">
						{#if verifyStep >= step.id}
							✓
						{:else}
							·
						{/if}
					</span>
					<div class="step-body">
						<div class="step-label">{step.label}</div>
						{#if verifyStep >= step.id}
							<div class="step-detail">{step.detail}</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		{#if verifyStep === STEPS.length - 1}
			<div class="chain-ok">CHAIN VERIFIED — connection proceeds ✓</div>
		{/if}

		<div class="controls">
			{#if verifyStep < 0}
				<button class="btn" onclick={runVerify} disabled={verifying}>
					{verifying ? 'VERIFYING…' : 'VERIFY CHAIN'}
				</button>
			{:else}
				<button class="btn" onclick={reset}>RESET</button>
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
		margin-bottom: 1rem;
	}

	.chain {
		display: flex;
		flex-direction: column-reverse;
		gap: 0;
		margin-bottom: 0.75rem;
		align-items: flex-start;
	}

	.cert-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-mono);
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		transition: border-color var(--transition-fast);
		width: 100%;
		max-width: 22rem;
	}

	.cert-card:hover { border-color: var(--color-border); }
	.cert-card.selected { border-color: var(--color-accent); }

	.cert-level {
		font-size: 0.52rem;
		letter-spacing: 0.12em;
	}

	.root { color: #e06c75; }
	.inter { color: #e5c07b; }
	.leaf { color: var(--color-accent); }

	.cert-subject {
		font-size: 0.7rem;
		color: var(--color-text);
	}

	.cert-badge {
		font-size: 0.52rem;
		color: var(--color-text-muted);
		opacity: 0.5;
		font-style: italic;
	}

	.cert-signed-by {
		font-size: 0.52rem;
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.chain-arrow {
		font-size: 0.58rem;
		color: var(--color-text-muted);
		opacity: 0.4;
		padding: 0.1rem 0.75rem;
		letter-spacing: 0.06em;
	}

	.detail-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.75rem 1rem;
		margin-bottom: 0.75rem;
	}

	.detail-title {
		font-size: 0.6rem;
		letter-spacing: 0.1em;
		color: var(--color-accent);
		margin-bottom: 0.6rem;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 5.5rem 1fr;
		gap: 0.25rem 0.5rem;
		margin-bottom: 0.6rem;
	}

	.dl {
		font-size: 0.52rem;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		opacity: 0.6;
		align-self: start;
		padding-top: 0.05rem;
	}

	.dv {
		font-size: 0.62rem;
		color: var(--color-text-muted);
		word-break: break-word;
	}

	.fp { opacity: 0.6; }

	.detail-note {
		font-size: 0.62rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		border-left: 2px solid var(--color-border-subtle);
		padding-left: 0.6rem;
		opacity: 0.7;
	}

	.sep {
		height: 1px;
		background: var(--color-border-subtle);
		margin: 0.5rem 0;
	}

	.verify-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.verify-title {
		font-size: 0.58rem;
		letter-spacing: 0.12em;
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.step {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		opacity: 0.35;
		transition: opacity 0.3s ease;
	}

	.step.done { opacity: 1; }
	.step.current { opacity: 1; }

	.step-icon {
		font-size: 0.65rem;
		color: #98c379;
		min-width: 0.8rem;
	}

	.step.done .step-icon { color: #98c379; }

	.step-body {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.step-label {
		font-size: 0.65rem;
		color: var(--color-text-muted);
	}

	.step.done .step-label { color: var(--color-text); }

	.step-detail {
		font-size: 0.58rem;
		color: var(--color-text-muted);
		opacity: 0.7;
		animation: fadeIn 0.25s ease;
	}

	.chain-ok {
		font-size: 0.68rem;
		color: #98c379;
		padding: 0.3rem 0.6rem;
		border: 1px solid rgba(152, 195, 121, 0.25);
		border-radius: var(--radius-sm);
		background: rgba(152, 195, 121, 0.06);
		animation: fadeIn 0.3s ease;
	}

	.controls {
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

	.btn:hover:not(:disabled) {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: default;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(2px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
