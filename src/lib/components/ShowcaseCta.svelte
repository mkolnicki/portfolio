<script lang="ts">
	interface Props {
		href: string;
		label: string;
	}

	const { href, label }: Props = $props();
</script>

<div class="cta-wrapper">
	<div class="cta-panel">
		<a class="cta-link" {href}>
			<span class="cta-text">{label}</span>
			<span class="cta-arrow" aria-hidden="true">&rarr;</span>
		</a>
	</div>
</div>

<style>
	.cta-wrapper {
		height: 100vh;
		position: relative;
	}

	.cta-panel {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg);
	}

	.cta-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: var(--text-2xl);
		font-weight: 500;
		color: var(--color-text);
		text-decoration: none;
		transition: color var(--transition-base);
	}

	.cta-link:hover {
		color: var(--color-accent);
	}

	.cta-arrow {
		display: inline-block;
		transition: transform var(--transition-base);
		font-size: 1.5em;
	}

	.cta-link:hover .cta-arrow {
		transform: translateX(8px);
	}

	@media (max-width: 768px) {
		.cta-wrapper {
			height: auto;
		}

		.cta-panel {
			position: relative;
			height: auto;
			padding: 4rem 0;
		}
	}
</style>
