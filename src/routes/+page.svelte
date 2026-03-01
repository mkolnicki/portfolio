<script lang="ts">
	import { resolve } from '$app/paths';

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

<main class="container front-page">
	<article class="lead-story">
		<h2 class="page-title">I build meaningful applications that help organizations scale and people flourish.</h2>
		<p class="page-deck text-muted">
			I am a software engineer who turns complex requirements into practical products that improve team
			velocity, user outcomes, and long-term business impact.
		</p>

		<div class="story-content hairline-top">
			<p>
				I entered software engineering through discipline before passion. That approach helped me
				learn quickly and ship early work, but it also showed me that speed without strong
				fundamentals does not scale.
			</p>
			<p>
				Over time, I shifted from a delivery-only mindset to deliberate engineering. I now prioritize
				clear architecture, maintainable code, thoughtful tradeoffs, and stronger review habits, and
				that has made my work more reliable and easier for teams to extend.
			</p>
			<p>
				Today I build applications that solve real operational and user problems. I care most about
				products that are trustworthy in production, simple to evolve, and genuinely useful to the
				people who depend on them.
			</p>
			<p>
				This portfolio is a working record of that approach. It highlights projects with meaningful
				implementation detail, writing that captures lessons learned, and the standards I use to ship
				quality software.
			</p>
		</div>
	</article>

	<aside class="sidebar hairline-left">
		<h3 class="sidebar-title uppercase font-sans text-small hairline-bottom">Highlights</h3>

		<div class="briefing-item hairline-bottom">
			<h4><a href={resolve('/projects')}>Recent Work</a></h4>
			<p class="text-small text-muted">A selection of passion projects and experiments.</p>
		</div>

		<div class="briefing-item hairline-bottom">
			<h4><a href={resolve('/about')}>About Me</a></h4>
			<p class="text-small text-muted">
				How experience shapes the way I build software.
			</p>
		</div>

		<div class="briefing-item">
			<h4>Get in Touch</h4>
			<p class="text-small text-muted">Open to building software that matters.</p>
			<ul class="contact-links font-sans text-small" aria-label="Social links">
				{#each socialLinks as link (link.name)}
					<li>
						<a class="contact-link" href={link.href} target="_blank" rel="noreferrer" aria-label={link.name}>
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
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</aside>
</main>

<style>
	.front-page {
		display: grid;
		grid-template-columns: 3fr 1fr;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
		align-items: start;
	}

	.lead-story {
		display: flex;
		flex-direction: column;
		padding: clamp(1rem, 1.4vw, 1.5rem);
		background: linear-gradient(
			165deg,
			color-mix(in srgb, var(--surface-elevated) 90%, var(--accent) 10%),
			var(--surface-1)
		);
		border: var(--hairline);
		box-shadow: var(--shadow-sm);
	}

	.page-title {
		font-size: var(--step-4);
		line-height: var(--leading-tight);
		margin-bottom: var(--spacing-sm);
		max-width: 18ch;
		text-wrap: balance;
	}

	.page-deck {
		font-size: var(--step-0);
		line-height: var(--leading-copy);
		margin-bottom: var(--spacing-md);
		max-width: 68ch;
	}

	.story-content {
		padding-top: var(--spacing-md);
		border-top: var(--hairline);
		column-count: 2;
		column-gap: var(--spacing-lg);
		text-align: justify;
		hyphens: auto;
	}

	.story-content p {
		margin-bottom: var(--spacing-md);
		max-width: none;
	}

	.sidebar {
		padding-left: var(--spacing-lg);
	}

	.sidebar-title {
		padding-bottom: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
		font-weight: 600;
		letter-spacing: 0.1em;
	}

	.briefing-item {
		padding-bottom: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		padding-inline: 0.65rem;
		padding-top: 0.45rem;
		background: var(--surface-1);
		border: var(--hairline);
		box-shadow: var(--shadow-sm);
	}

	.briefing-item h4 {
		margin-bottom: var(--spacing-xs);
		font-size: 1.125rem;
	}

	.briefing-item h4 a {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-decoration-color: color-mix(in srgb, var(--accent) 60%, transparent);
	}

	.contact-links {
		list-style: none;
		padding: 0;
		margin: var(--spacing-xs) 0 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	.contact-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: 1px solid color-mix(in srgb, var(--border-color) 72%, transparent);
		border-radius: 999px;
		background: var(--surface-elevated);
	}

	.contact-link svg {
		width: 1rem;
		height: 1rem;
		fill: currentColor;
		color: var(--accent);
	}

	.contact-link:hover {
		color: var(--accent);
	}

	.briefing-item:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	@media (max-width: 1024px) {
		.story-content {
			column-count: 1;
		}
	}

	@media (max-width: 768px) {
		.front-page {
			grid-template-columns: 1fr;
		}

		.sidebar {
			padding-left: 0;
			border-left: none;
			border-top: var(--thick-line);
			padding-top: var(--spacing-md);
			margin-top: var(--spacing-md);
		}
	}
</style>
