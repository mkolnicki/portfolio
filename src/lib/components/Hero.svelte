<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import HeroBackground from '$lib/components/HeroBackground.svelte';
</script>

<section class="hero">
	<div class="hero__bg-gradient"></div>
	<HeroBackground />
	<div class="hero__inner container">
		<h1 class="hero__name">
			<span class="hero__name-sans" use:reveal={{ delay: 0, distance: '30px', duration: 800 }}>Aesthetic craft meets</span>
			<span class="hero__name-serif" use:reveal={{ delay: 150, distance: '50px', duration: 1000 }}>Technical precision.</span>
		</h1>
		<div class="hero__content" use:reveal={{ delay: 300, distance: '20px', duration: 800 }}>
			<p class="hero__tagline">Matthew Kolnicki — Software engineer working at the intersection of AI and modern web development. I care about craft, clarity, and shipping work that holds up.</p>
			<a href="projects" class="hero__cta">Explore my work</a>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden;
		min-height: 100dvh;
		display: flex;
		align-items: flex-end;
		padding-bottom: 8rem;
	}

	.hero__bg-gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, var(--color-bg) 0%, transparent 60%);
		z-index: 1;
		pointer-events: none;
	}

	.hero__inner {
		position: relative;
		z-index: 2;
		width: 100%;
	}

	.hero__name {
		display: flex;
		flex-direction: column;
		line-height: 1.1;
		margin-bottom: 2rem;
	}

	.hero__name-sans {
		font-family: var(--font-body);
		font-size: clamp(1rem, 1vw + 0.5rem, 1.25rem);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		margin-bottom: -1rem;
		padding-left: 0.25rem;
	}

	.hero__name-serif {
		font-family: var(--font-body);
		font-size: clamp(3.5rem, 7vw + 1rem, 8rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.hero__content {
		max-width: 32rem;
	}

	.hero__tagline {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.hero__cta {
		display: inline-flex;
		align-items: center;
		padding: 0.875rem 2rem;
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-bg);
		background-color: var(--color-accent);
		border-radius: 100px;
		transition: transform 250ms var(--ease-spring), background-color var(--transition-fast);
	}

	.hero__cta:hover {
		transform: scale(1.03);
		background-color: var(--color-accent-hover);
	}

	@media (max-width: 639px) {
		.hero__name-sans {
			margin-bottom: 0;
		}

		.hero__name-serif {
			font-size: clamp(2.5rem, 10vw, 3.5rem);
		}
	}

	@media (min-width: 640px) {
		.hero {
			padding-bottom: 12rem;
		}
	}
</style>
