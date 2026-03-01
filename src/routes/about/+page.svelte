<main class="container about-page">
	<article class="about-story">
		<header class="about-header thick-bottom">
			<h2 class="page-title">I build products that solve meaningful problems and create durable value.</h2>
			<p class="page-deck text-muted">
				I focus on shipping applications that help organizations scale while improving the daily
				experience of the people who use them.
			</p>
		</header>
		<div class="story-body hairline-top">
				<p>
					At Digital Hands, I work across product and platform initiatives to turn complex business
					needs into dependable software experiences. My goal is to ship work that is useful
					immediately and still maintainable as teams and requirements grow.
				</p>
				<p>
					A significant part of my recent work involves AI and LLM integration, and I approach it
					with practical expectations. I prioritize clear constraints, measurable outcomes, and
					thoughtful implementation so the result supports real people instead of adding noise.
				</p>
		</div>
	</article>

	<aside class="about-briefings hairline-left">
		<h3 class="uppercase font-sans text-small hairline-bottom">Quick Facts</h3>
		<div class="briefing-item hairline-bottom">
			<h4>Current Role</h4>
			<p class="text-small text-muted">
				Software Engineer at Digital Hands since 2023, building applications that support growing
				teams and evolving products.
			</p>
		</div>
		<div class="briefing-item hairline-bottom">
			<h4>Core Technologies</h4>
			<p class="text-small text-muted">
				Python, SQL, FastAPI, SQLAlchemy, PostgreSQL/Aurora, BigQuery, Redis, OpenSearch, AWS, GCP,
				and GitHub Actions.
			</p>
		</div>
		<div class="briefing-item">
			<h4>Specialties</h4>
			<p class="text-small text-muted">
				Product-minded engineering, scalable application design, developer experience, and
				production-ready AI integration.
			</p>
		</div>
	</aside>
</main>

<style>
	.about-page {
		display: grid;
		grid-template-columns: 3fr 1fr;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
		align-items: start;
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
		.about-page {
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
