<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
</script>

<section class="cta container">
	<div class="cta__inner" use:reveal={{ distance: '40px', duration: 1000 }}>
		<h2 class="cta__title">Ready to build something exceptional?</h2>
		<p class="cta__subtitle">Let's collaborate on bringing precision and craft to your next project.</p>
		<a href="mailto:matthew@example.com" class="cta__button">
			Initialize Sequence <span class="cta__arrow">&rarr;</span>
		</a>
	</div>
</section>

<style>
	.cta {
		padding: 6rem 1rem;
		display: flex;
		justify-content: center;
	}

	.cta__inner {
		background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-2xl);
		padding: 4rem 2rem;
		width: 100%;
		max-width: 48rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 24px 48px rgba(0,0,0,0.4);
		position: relative;
		overflow: hidden;
	}

	.cta__inner::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%);
		opacity: 0.5;
	}

	.cta__title {
		font-family: var(--font-body);
		font-size: var(--text-4xl);
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: 1rem;
		line-height: 1.1;
	}

	.cta__subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-width: 32rem;
		margin-bottom: 2.5rem;
		line-height: 1.5;
	}

	.cta__button {
		display: inline-flex;
		align-items: center;
		padding: 1rem 2.5rem;
		font-family: var(--font-mono);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-bg);
		background-color: var(--color-accent);
		border-radius: 100px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: transform 250ms var(--ease-spring), background-color var(--transition-fast), box-shadow var(--transition-fast);
	}

	.cta__button:hover {
		transform: scale(1.05) translateY(-2px);
		background-color: var(--color-accent-hover);
		box-shadow: 0 8px 24px rgba(201, 168, 76, 0.3); /* Champagne glow */
	}

	.cta__arrow {
		display: inline-block;
		margin-left: 0.5rem;
		transition: transform 250ms var(--ease-out-expo);
	}

	.cta__button:hover .cta__arrow {
		transform: translateX(4px);
	}
</style>
