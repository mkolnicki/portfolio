<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<main class="container front-page">
	<article class="lead-story">
		<h2 class="headline">I love building systems and digging deep into how they work.</h2>
		<p class="deck text-muted">
			I’m a backend developer and data engineer focused on developer experience, practical AI, and the
			kind of engineering that makes teams faster and calmer.
		</p>

		<div class="story-content hairline-top">
			<p>
				I currently work at Digital Hands, where I build backend and data systems for cybersecurity and
				operations. Most days, that means APIs, data pipelines, and cloud infrastructure across AWS and
				GCP.
			</p>
			<p>
				I’m especially drawn to deep technical exploration: understanding why systems behave the way
				they do, then shaping them into something simpler to use and easier to maintain.
			</p>
			<p>
				I care a lot about developer experience, from clearer interfaces and cleaner data models to
				better tooling around debugging, testing, and day-to-day workflows.
			</p>
			<p>
				Whether I’m working on platform reliability, analytics, or AI features, my goal is the same:
				build thoughtful systems that feel good to work with.
			</p>
		</div>
	</article>

	<aside class="sidebar hairline-left">
		<h3 class="sidebar-title uppercase font-sans text-small hairline-bottom">Highlights</h3>

		<div class="briefing-item hairline-bottom">
			<h4><a href={resolve('/projects')}>Recent Work</a></h4>
			<p class="text-small text-muted">
				A selection of backend, data, and AI projects built with Python, SQL, FastAPI, and cloud
				services across AWS and GCP.
			</p>
		</div>

		<div class="briefing-item hairline-bottom">
			<h4><a href={resolve('/about')}>About Me</a></h4>
			<p class="text-small text-muted">
				Background, technical strengths, and the engineering approach behind my work in production
				systems and analytics.
			</p>
		</div>

		<div class="briefing-item">
			<h4>Get in Touch</h4>
			<p class="text-small text-muted">
				Open to product engineering roles, consulting, and technical collaborations focused on
				reliable backend and data platforms.
			</p>
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

	.headline {
		font-size: var(--step-5);
		line-height: 1.05;
		margin-bottom: var(--spacing-sm);
		max-width: 20ch;
		text-wrap: balance;
	}

	.deck {
		font-size: var(--step-1);
		font-style: italic;
		margin-bottom: var(--spacing-md);
		max-width: 68ch;
		color: color-mix(in srgb, var(--text-color) 78%, var(--accent) 22%);
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
