<script lang="ts">
	type SocialLink = {
		name: 'LinkedIn' | 'X' | 'GitHub';
		href: string;
	};

	const socialLinks: SocialLink[] = [
		{ name: 'LinkedIn', href: 'https://www.linkedin.com/in/mattkolnicki/' },
		{ name: 'X', href: 'https://x.com/MattKolnicki' },
		{ name: 'GitHub', href: 'https://github.com/mkolnicki' }
	];
</script>

<footer class="site-footer container hairline-top" aria-label="Footer">
	<div class="footer-row">
		<p class="footer-copy font-sans text-small text-muted">Connect with me</p>
		<ul class="social-links" aria-label="Social links">
			{#each socialLinks as link (link.name)}
				<li>
					<a
						class="social-link"
						href={link.href}
						target="_blank"
						rel="noreferrer"
						aria-label={link.name}
						title={link.name}
					>
						{#if link.name === 'LinkedIn'}
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path
									d="M6.94 8.5a1.56 1.56 0 1 1 0-3.12 1.56 1.56 0 0 1 0 3.12zM5.62 10h2.65v8.37H5.62V10zM10.02 10h2.54v1.14h.04c.35-.67 1.22-1.37 2.5-1.37 2.67 0 3.16 1.76 3.16 4.05v4.55H15.6v-4.03c0-.96-.02-2.2-1.34-2.2-1.35 0-1.56 1.05-1.56 2.13v4.1h-2.68V10z"
								/>
							</svg>
						{:else if link.name === 'X'}
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path
									d="M18.9 3.1h2.94l-6.42 7.34 7.56 10.46h-5.92l-4.64-6.36-5.56 6.36H3.9l6.87-7.85L3.52 3.1h6.07l4.19 5.77L18.9 3.1zm-1.04 15.97h1.63L8.71 4.84H6.96l10.9 14.23z"
								/>
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path
									d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.87c-2.78.6-3.37-1.19-3.37-1.19-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.61.07-.61 1 .07 1.52 1.02 1.52 1.02.89 1.52 2.34 1.08 2.91.83.09-.64.35-1.08.64-1.33-2.22-.25-4.55-1.1-4.55-4.9 0-1.08.39-1.97 1.02-2.66-.1-.25-.44-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.21 2.39.1 2.64.64.69 1.02 1.58 1.02 2.66 0 3.82-2.34 4.65-4.57 4.9.36.31.68.92.68 1.86v2.75c0 .27.18.59.69.48A10 10 0 0 0 12 2z"
								/>
							</svg>
						{/if}
						<span class="font-sans text-small">{link.name}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</footer>

<style>
	.site-footer {
		padding-top: var(--spacing-md);
		padding-bottom: var(--spacing-lg);
		margin-top: var(--spacing-xl);
	}

	.footer-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
	}

	.footer-copy {
		margin: 0;
	}

	.social-links {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.social-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.65rem;
		border: 1px solid color-mix(in srgb, var(--border-color) 72%, transparent);
		border-radius: 99px;
		background: var(--surface-1);
		box-shadow: var(--shadow-sm);
	}

	.social-link svg {
		width: 1rem;
		height: 1rem;
		fill: currentColor;
		color: var(--accent);
		flex-shrink: 0;
	}

	.social-link:hover {
		color: var(--accent);
		background: var(--surface-elevated);
		transform: translateY(-1px);
	}

	.social-link:active {
		transform: translateY(0);
	}

	@media (max-width: 700px) {
		.footer-row {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
