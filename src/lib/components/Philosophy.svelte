<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
</script>

<section class="philosophy">
	<div class="philosophy__bg"
		style="background-image: url('https://images.unsplash.com/photo-1598380315993-9c8e8dbe8f8c?q=80&w=2938&auto=format&fit=crop'); opacity: 0.15;">
	</div>

	<div class="philosophy__content container">
		<div class="philosophy__statement">
			<p class="philosophy__common" use:reveal={{ distance: '20px', duration: 800 }}>
				Most web development focuses on: 
				<br/>
				<span class="philosophy__common-val">assemblies of generic components</span>.
			</p>
			<p class="philosophy__focus" use:reveal={{ delay: 200, distance: '30px', duration: 1000 }}>
				I focus on: 
				<br/>
				<span class="philosophy__focus-val">digital instruments with mechanical precision</span>.
			</p>
		</div>
	</div>
</section>

<style>
	.philosophy {
		position: relative;
		width: 100vw;
		left: 50%;
		right: 50%;
		margin-left: -50vw;
		margin-right: -50vw;
		background-color: var(--color-bg);
		padding: 8rem 0;
		overflow: hidden;
		display: flex;
		align-items: center;
		min-height: 80vh;
		border-top: 1px solid var(--color-border-subtle);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.philosophy__bg {
		position: absolute;
		inset: -10%;
		background-size: cover;
		background-position: center;
		background-attachment: fixed; /* Simple parallax effect */
		pointer-events: none;
		z-index: 0;
		filter: grayscale(100%) contrast(1.2);
		mix-blend-mode: overlay;
	}

	.philosophy__content {
		position: relative;
		z-index: 1;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.philosophy__statement {
		max-width: 48rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.philosophy__common {
		font-family: var(--font-body);
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.philosophy__common-val {
		color: var(--color-text);
		font-weight: 500;
	}

	.philosophy__focus {
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 600;
	}

	.philosophy__focus-val {
		display: block;
		font-family: var(--font-body);
		font-size: clamp(2.5rem, 5vw + 1rem, 5rem);
		font-weight: 700;
		color: var(--color-accent);
		text-transform: none;
		letter-spacing: -0.02em;
		line-height: 1.1;
		margin-top: 1rem;
	}
</style>
