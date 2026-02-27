<main class="container about-page">
	<header class="about-header thick-bottom">
		<h2 class="page-title">Backend Developer and Data Engineer</h2>
		<p class="page-deck text-muted">
			I’m most energized by technology, developer experience, and deep technical exploration.
		</p>
	</header>

	<section class="about-layout">
		<article class="about-story">
			<div class="story-body hairline-top">
				<p>
					At Digital Hands, I work across backend development, data engineering, and cloud
					infrastructure. I enjoy moving between systems work and product-facing problems, especially
					when it means making complex things feel straightforward.
				</p>
				<p>
					A lot of my recent work has involved AI and LLM integrations, but I’m most interested in the
					practical side: how these tools fit into real workflows and improve the experience for the
					people using them.
				</p>
				<p>
					I care deeply about developer experience. Good tooling, clear abstractions, and predictable
					systems make teams more effective and make software more enjoyable to build.
				</p>
				<p>
					I like going deep technically, learning new systems end-to-end, and then distilling that
					complexity into solutions that are clean, reliable, and maintainable.
				</p>
			</div>
		</article>

		<aside class="about-briefings hairline-left">
			<h3 class="uppercase font-sans text-small hairline-bottom">Quick Facts</h3>
			<div class="briefing-item hairline-bottom">
				<h4>Current Role</h4>
				<p class="text-small text-muted">
					Backend Developer & Data Engineer at Digital Hands (Feb 2023 - Present).
				</p>
			</div>
			<div class="briefing-item hairline-bottom">
				<h4>Core Technologies</h4>
				<p class="text-small text-muted">
					Python, SQL, FastAPI, SQLAlchemy, PostgreSQL/Aurora, BigQuery, Redis, OpenSearch, AWS,
					GCP, and GitHub Actions.
				</p>
			</div>
			<div class="briefing-item">
				<h4>Specialties</h4>
				<p class="text-small text-muted">
					Developer experience, LLM integration, API reliability, ETL design, and cloud architecture.
				</p>
			</div>
		</aside>
	</section>
</main>

<style>
	.about-page {
		margin-bottom: var(--spacing-xl);
	}

	.about-header {
		padding-bottom: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.page-title {
		font-size: var(--step-4);
		line-height: var(--leading-tight);
		margin-bottom: var(--spacing-sm);
		text-wrap: balance;
	}

	.about-header .page-title {
		max-width: 18ch;
	}

	.page-deck {
		font-size: var(--step-0);
		line-height: var(--leading-copy);
		max-width: 68ch;
	}

	.about-layout {
		display: grid;
		grid-template-columns: 3fr 1fr;
		gap: var(--spacing-lg);
		align-items: start;
	}

	.story-body {
		padding-top: var(--spacing-md);
		border-top: var(--hairline);
		column-count: 2;
		column-gap: var(--spacing-lg);
		text-align: justify;
		hyphens: auto;
		padding-inline: clamp(0.65rem, 1.2vw, 1rem);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--surface-elevated) 90%, var(--accent) 10%),
			var(--surface-1)
		);
		border: var(--hairline);
		box-shadow: var(--shadow-sm);
	}

	.about-briefings {
		padding-left: var(--spacing-lg);
	}

	.about-briefings h3 {
		padding-bottom: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
	}

	.briefing-item {
		padding-bottom: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		padding-inline: 0.65rem;
		padding-top: 0.45rem;
		background: var(--surface-1);
		border: var(--hairline);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-med) var(--ease-standard);
	}

	.briefing-item h4 {
		margin-bottom: var(--spacing-xs);
		font-size: 1.125rem;
	}

	.briefing-item:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	@media (max-width: 1024px) {
		.story-body {
			column-count: 1;
		}
	}

	@media (max-width: 768px) {
		.about-layout {
			grid-template-columns: 1fr;
		}

		.about-briefings {
			padding-left: 0;
			border-left: none;
			border-top: var(--thick-line);
			padding-top: var(--spacing-md);
			margin-top: var(--spacing-md);
		}
	}
</style>
