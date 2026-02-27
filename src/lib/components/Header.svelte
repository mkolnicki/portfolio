<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let theme = $state('light');
	type NavLink = {
		href: '/' | '/projects' | '/blog' | '/about';
		label: string;
	};

	const navLinks: NavLink[] = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/about', label: 'About' }
	];

	function isActivePath(href: string) {
		const pathname = page.url.pathname;
		return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
	}

	onMount(() => {
		theme = localStorage.getItem('theme') || 'light';
		applyTheme(theme);
	});

	function applyTheme(resolvedTheme: string) {
		document.body?.classList.remove('light', 'dark', 'natural');
		document.body?.classList.add(resolvedTheme);
	}

	function toggleTheme() {
		const themes = ['light', 'natural', 'dark'];
		const currentIndex = themes.indexOf(theme);
		const newTheme = themes[(currentIndex + 1) % themes.length];

		theme = newTheme;
		localStorage.setItem('theme', newTheme);
		applyTheme(newTheme);
	}
</script>

<header class="masthead container">
	<div class="masthead-title-row">
		<h1 class="masthead-title">Matthew Kolnicki</h1>
		<div class="masthead-actions">
			<button
				class="toggle-btn font-sans text-small"
				aria-label="Toggle theme"
				onclick={toggleTheme}
			>
				<svg
					class="icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					{#if theme === 'light'}
						<circle cx="12" cy="12" r="5"></circle>
						<line x1="12" y1="1" x2="12" y2="3"></line>
						<line x1="12" y1="21" x2="12" y2="23"></line>
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
						<line x1="1" y1="12" x2="3" y2="12"></line>
						<line x1="21" y1="12" x2="23" y2="12"></line>
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
					{:else if theme === 'dark'}
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
					{:else}
						<path d="M12 22v-8"></path>
						<path d="M5 12a7 7 0 0 1 7 7 7 7 0 0 1-7-7z"></path>
						<path d="M19 8a7 7 0 0 0-7 7 7 7 0 0 0 7-7z"></path>
					{/if}
				</svg>
				<span>{theme === 'light' ? 'Light' : theme === 'natural' ? 'Natural' : 'Dark'}</span>
			</button>
		</div>
	</div>

	<nav class="masthead-nav thick-top hairline-bottom">
		<ul class="nav-list font-serif">
			{#each navLinks as link (link.href)}
				<li>
					<a href={resolve(link.href)} class:active={isActivePath(link.href)}>{link.label}</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	.masthead {
		padding-top: var(--spacing-md);
		padding-bottom: var(--spacing-md);
		text-align: center;
	}

	.masthead-title-row {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		margin-bottom: var(--spacing-sm);
	}

	.masthead-title {
		grid-column: 2;
		font-size: clamp(1.7rem, 2.8vw, 2.45rem);
		font-weight: 400;
		margin: 0;
		letter-spacing: -0.01em;
		line-height: 1.05;
	}

	.masthead-actions {
		grid-column: 3;
		justify-self: end;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.masthead-nav {
		padding: var(--spacing-sm) 0;
		margin-bottom: var(--spacing-lg);
	}

	.nav-list {
		display: flex;
		justify-content: center;
		gap: var(--spacing-xl);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-list a {
		position: relative;
		display: inline-flex;
		padding: 0.2rem 0.35rem;
		border-radius: 0.15rem;
		font-size: 1.23rem;
	}

	.nav-list a:hover {
		color: color-mix(in srgb, var(--text-color) 75%, var(--accent) 25%);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--accent) 65%, transparent);
	}

	.nav-list a.active {
		color: color-mix(in srgb, var(--text-color) 72%, var(--accent) 28%);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 5px;
		text-decoration-color: color-mix(in srgb, var(--accent) 72%, transparent);
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--surface-1);
		border: 1px solid var(--border-color);
		color: var(--text-color);
		border-radius: 99px;
		padding: 0.25rem 0.75rem;
		cursor: pointer;
		box-shadow: var(--shadow-sm);
	}

	.toggle-btn:hover {
		background: var(--surface-elevated);
		color: var(--accent);
		transform: translateY(-1px);
	}

	.toggle-btn:active {
		transform: translateY(0);
	}

	.icon {
		width: 1rem;
		height: 1rem;
	}

	@media (max-width: 600px) {
		.masthead-title-row {
			grid-template-columns: 1fr;
			gap: var(--spacing-xs);
		}
		.masthead-title {
			grid-column: 1;
		}
		.masthead-actions {
			grid-column: 1;
			justify-self: center;
		}
		.nav-list {
			gap: var(--spacing-md);
			flex-wrap: wrap;
		}
	}
</style>
