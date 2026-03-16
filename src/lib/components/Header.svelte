<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' }
	];

	let scrollY = $state(0);
	let scrolled = $derived(scrollY > 50);
</script>

<svelte:window bind:scrollY />

<header class="header" class:header--scrolled={scrolled}>
	<div class="header__inner">
		<nav class="header__nav" aria-label="Main navigation">
			<a href="/" class="header__logo" aria-label="Home page">MK</a>
			<ul class="header__links">
				{#each links as { href, label }}
					<li>
						<a {href} class="header__link" aria-current={page.url.pathname === href ? 'page' : undefined}>
							{label}
						</a>
					</li>
				{/each}
			</ul>
			<a href="mailto:contact@example.com" class="header__cta">Get in Touch</a>
		</nav>
	</div>
</header>

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		padding: 1.5rem 1rem;
		transition: padding var(--transition-base), transform var(--transition-base);
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.header--scrolled {
		padding: 1rem;
	}

	.header__inner {
		pointer-events: auto;
		width: 100%;
		max-width: 48rem;
		border-radius: 100px;
		background-color: transparent;
		transition: background-color var(--transition-base), box-shadow var(--transition-base), border var(--transition-base);
		border: 1px solid transparent;
		padding: 0 1.5rem;
	}

	.header--scrolled .header__inner {
		background-color: color-mix(in srgb, var(--color-bg) 75%, transparent);
		backdrop-filter: blur(16px);
		border-color: var(--color-border-subtle);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.header__nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 3.5rem;
	}

	.header__logo {
		font-weight: 700;
		font-size: var(--text-lg);
		color: var(--color-text);
		letter-spacing: -0.02em;
		transition: color var(--transition-fast);
	}

	.header__logo:hover {
		color: var(--color-accent-hover);
	}

	.header__links {
		display: flex;
		gap: 1.25rem;
	}

	@media (min-width: 640px) {
		.header__links {
			gap: 2rem;
		}
	}

	.header__link {
		position: relative;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-muted);
		transition: color var(--transition-fast), transform var(--transition-fast);
		display: inline-block;
	}

	.header__link:hover {
		color: var(--color-text);
		transform: translateY(-1px);
	}

	.header__link[aria-current='page'] {
		color: var(--color-text);
	}

	.header__cta {
		display: none;
		align-items: center;
		padding: 0.5rem 1.25rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-bg);
		background-color: var(--color-accent);
		border-radius: 100px;
		transition: transform 250ms var(--ease-spring), background-color var(--transition-fast);
	}

	.header__cta:hover {
		transform: scale(1.03) translateY(-1px);
		background-color: var(--color-accent-hover);
	}

	@media (min-width: 640px) {
		.header__cta {
			display: flex;
		}
	}
</style>
