<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onNavigate } from '$app/navigation';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<a href="#main-content" class="skip-link">Skip to content</a>

<div class="app">
	<Header />
	<main id="main-content" class="main">
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.skip-link {
		position: absolute;
		top: -100%;
		left: 1rem;
		z-index: 100;
		padding: 0.5rem 1rem;
		background: var(--color-accent);
		color: var(--color-bg);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.skip-link:focus {
		top: 0.5rem;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		position: relative;
	}

	.app::before {
		content: '';
		position: fixed;
		inset: 0;
		background: var(--bg-noise);
		opacity: 0.03;
		pointer-events: none;
		z-index: 100;
	}

	.main {
		flex: 1;
	}
</style>
