<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { reveal } from '$lib/actions/reveal';
</script>

<Seo title="About" description="Software engineer working at the intersection of AI and modern web development." />

<section class="about-hero">
	<div class="about-hero__inner container">
		<div class="about-hero__eyebrow" use:reveal={{ delay: 0, distance: '20px' }}>About</div>
		<h1 class="about-hero__title" use:reveal={{ delay: 100, distance: '30px', duration: 800 }}>
			<span class="about-hero__line">I automate the</span>
			<span class="about-hero__line about-hero__line--accent">annoying sh*t.</span>
		</h1>
		<p class="about-hero__tagline" use:reveal={{ delay: 250, distance: '20px' }}>
			Building human-centric software.
		</p>
	</div>
</section>

<section class="about-section container">
	<div class="about-grid">
		<div class="about-grid__sticky" use:reveal={{ delay: 0, distance: '20px' }}>
			<h2 class="about-section__heading">Background</h2>
			<p class="about-section__subtext">How I got here, and what drives the work.</p>
		</div>
		<div class="about-grid__content">
			<div class="about-text" use:reveal={{ delay: 100, distance: '20px' }}>
				<p>
					Software development was never an inherent passion of mine, despite my Pre-K superlative: “Most Likely to Work with Computers.” However, I've always been deeply interested in technology. I first wrote code to automate the repetitive tasks I frequently ran into: downloading favorited photos off my camera, creating my own sunrise lamp before I knew it was a thing so every morning alarm was a bit less jarring, and generally caring about the ways that software can subtly improve my life.
				</p>
				<p>
					I think it is far easier to find solutions for your own problems than it is for someone else's, but our problems are seldom unique. The more code I write, the more I search for tools that make writing code easier. Luckily, there are so many like-minded developers that there are near-endless options to choose from for your IDE, LSP, linters, formatters, etc. I would naturally gravitate towards developer tools if there weren't already such great options out there that satisfy my needs.
				</p>
				<p>
					Therefore, I've turned my attention back towards my own everyday problems that the layman also faces. If you see any projects from me in the near future, they'll likely fall into one of these categories: privacy, security, or software affordability.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="about-section container">
	<div class="about-grid">
		<div class="about-grid__sticky" use:reveal={{ delay: 0, distance: '20px' }}>
			<h2 class="about-section__heading">Capabilities</h2>
			<p class="about-section__subtext">Tools, technologies, and domains I work in.</p>
		</div>
		<div class="about-grid__content">
			<div class="skills-grid">
				<div class="skill-card" use:reveal={{ delay: 0, distance: '16px' }}>
					<h3 class="skill-card__title">Languages</h3>
					<ul class="skill-card__list">
						<li>TypeScript</li>
						<li>Python</li>
						<li>SQL</li>
					</ul>
				</div>
				<div class="skill-card" use:reveal={{ delay: 80, distance: '16px' }}>
					<h3 class="skill-card__title">Frontend</h3>
					<ul class="skill-card__list">
						<li>Svelte / SvelteKit</li>
						<li>React / Next.js</li>
					</ul>
				</div>
				<div class="skill-card" use:reveal={{ delay: 160, distance: '16px' }}>
					<h3 class="skill-card__title">Backend & Systems</h3>
					<ul class="skill-card__list">
						<li>Node.js / Express</li>
						<li>PostgreSQL</li>
						<li>Redis</li>
						<li>gRPC / REST</li>
						<li>Distributed Systems</li>
					</ul>
				</div>
				<div class="skill-card" use:reveal={{ delay: 240, distance: '16px' }}>
					<h3 class="skill-card__title">DevOps & Cloud</h3>
					<ul class="skill-card__list">
						<li>AWS (Lambda, S3, EC2)</li>
						<li>Terraform</li>
						<li>Docker</li>
						<li>CI/CD (GitHub Actions)</li>
						<li>Serverless Architectures</li>
					</ul>
				</div>
				<div class="skill-card" use:reveal={{ delay: 320, distance: '16px' }}>
					<h3 class="skill-card__title">AI & Data</h3>
					<ul class="skill-card__list">
						<li>LLM Integration</li>
						<li>Embeddings & Vector DBs</li>
						<li>Data Engineering</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="about-section container">
	<div class="about-grid">
		<div class="about-grid__sticky" use:reveal={{ delay: 0, distance: '20px' }}>
			<h2 class="about-section__heading">Experience</h2>
			<p class="about-section__subtext">Where I've worked and what I've built.</p>
		</div>
		<div class="about-grid__content">
			<div class="timeline">
				<div class="timeline__item" use:reveal={{ delay: 0, distance: '20px' }}>
					<div class="timeline__meta">
						<span class="timeline__date">2023 — Current</span>
						<span class="timeline__dot" aria-hidden="true"></span>
					</div>
					<div class="timeline__body">
						<h3 class="timeline__title">Software Engineer</h3>
						<p class="timeline__company">Digital Hands</p>
						<p class="timeline__desc">
							Led the development of our customer portal, serving as both product manager and technical lead. Defined the roadmap, designed the architecture, and built core features end-to-end; I continue to maintain and ship improvements to our live customer-facing platform.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="about-section about-section--last container">
	<div class="about-grid">
		<div class="about-grid__sticky" use:reveal={{ delay: 0, distance: '20px' }}>
			<h2 class="about-section__heading">Education</h2>
			<p class="about-section__subtext">Formal training and continuous learning.</p>
		</div>
		<div class="about-grid__content">
			<div class="education-card" use:reveal={{ delay: 100, distance: '20px' }}>
				<h3 class="education-card__degree">B.S. Computer Science</h3>
				<p class="education-card__school">Florida State University</p>
				<p class="education-card__detail">Focus on algorithms, systems programming, and software engineering. Relevant coursework in cryptography, distributed systems, and machine learning.</p>
			</div>
			<div class="education-card" use:reveal={{ delay: 200, distance: '20px' }}>
				<h3 class="education-card__degree">Continuous Learning</h3>
				<p class="education-card__school">Self-directed</p>
				<p class="education-card__detail">Active in open-source communities, technical writing, and exploring emerging tools in AI and systems design. I learn by building — this portfolio is proof.</p>
			</div>
		</div>
	</div>
</section>

<style>
	/* Hero */
	.about-hero {
		position: relative;
		padding-top: 10rem;
		padding-bottom: 6rem;
	}

	.about-hero__eyebrow {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-accent);
		margin-bottom: 1.5rem;
	}

	.about-hero__title {
		display: flex;
		flex-direction: column;
		line-height: 1.1;
		margin-bottom: 2rem;
	}

	.about-hero__line {
		font-size: clamp(2.5rem, 6vw + 1rem, 5rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.about-hero__line--accent {
		color: var(--color-accent);
	}

	.about-hero__tagline {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		line-height: 1.6;
		max-width: 36rem;
	}

	/* Sections */
	.about-section {
		padding-top: 5rem;
		padding-bottom: 5rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	.about-section--last {
		padding-bottom: 8rem;
	}

	.about-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
	}

	@media (min-width: 768px) {
		.about-grid {
			grid-template-columns: 280px 1fr;
			gap: 4rem;
		}
	}

	.about-grid__sticky {
		align-self: start;
	}

	.about-section__heading {
		font-size: var(--text-2xl);
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.75rem;
	}

	.about-section__subtext {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	/* Bio text */
	.about-text {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.about-text p {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: 1.7;
	}

	/* Skills */
	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
		gap: 1.5rem;
	}

	.skill-card {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		transition: border-color var(--transition-fast), transform var(--transition-fast);
	}

	.skill-card:hover {
		border-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-border));
		transform: translateY(-2px);
	}

	.skill-card__title {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
		margin-bottom: 1rem;
	}

	.skill-card__list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skill-card__list li {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: 1.4;
	}

	/* Timeline */
	.timeline {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.timeline__item {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.timeline__item {
			grid-template-columns: 140px 1fr;
			gap: 2rem;
		}
	}

	.timeline__meta {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.timeline__date {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-muted);
		white-space: nowrap;
		padding-top: 0.25rem;
	}

	.timeline__dot {
		display: none;
		width: 8px;
		height: 8px;
		background-color: var(--color-accent);
		border-radius: 50%;
		margin-top: 0.4rem;
		flex-shrink: 0;
	}

	@media (min-width: 640px) {
		.timeline__dot {
			display: block;
		}
	}

	.timeline__title {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.timeline__company {
		font-size: var(--text-sm);
		color: var(--color-accent);
		margin-bottom: 0.75rem;
	}

	.timeline__desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	/* Education */
	.education-card {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		margin-bottom: 1rem;
		transition: border-color var(--transition-fast);
	}

	.education-card:hover {
		border-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-border));
	}

	.education-card__degree {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.education-card__school {
		font-size: var(--text-sm);
		color: var(--color-accent);
		margin-bottom: 0.75rem;
	}

	.education-card__detail {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	/* Responsive */
	@media (max-width: 767px) {
		.about-hero {
			padding-top: 8rem;
			padding-bottom: 4rem;
		}

		.about-section {
			padding-top: 3rem;
			padding-bottom: 3rem;
		}

		.about-section--last {
			padding-bottom: 6rem;
		}
	}
</style>
