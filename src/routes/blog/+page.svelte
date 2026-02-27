<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	const fullDate = new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
	const compactDate = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });

	let monthlyCounts = $derived(data.metrics.monthlyCounts);
	let maxMonthlyCount = $derived(Math.max(...monthlyCounts.map((item) => item.count), 1));
</script>

<main class="container blog-page">
	<header class="blog-header thick-bottom">
		<p class="kicker uppercase font-sans text-small">Blog</p>
		<h2>Engineering Notes</h2>
		<p class="text-muted">
			Writing on backend engineering, data systems, and practical AI implementation. Published from
			Sanity Studio without redeploying the site.
		</p>
	</header>

	{#if data.authError}
		<p class="auth-warning font-sans text-small">
			Blog is connected but blocked by Sanity auth. Add <code>SANITY_API_READ_TOKEN</code> to your app
			env and restart the dev server.
		</p>
	{/if}

	<div class="blog-layout">
		<section class="blog-rail">
			{#if data.posts.length === 0}
				<p>No blog posts published yet.</p>
			{:else}
				<ul class="post-list">
					{#each data.posts as post, index (post.slug)}
						<li class="post-item">
							<a class="post-card" href={resolve('/blog/[slug]', { slug: post.slug })}>
								<span class="post-index font-sans text-small"
									>{String(index + 1).padStart(2, '0')}</span
								>
								<div class="post-summary">
									<h3>{post.title}</h3>
									<p class="text-muted">{post.excerpt}</p>
									<p class="post-meta font-sans text-small text-muted">
										{fullDate.format(new Date(post.publishedAt))}
										{#if post.readingMinutes}
											· {post.readingMinutes} min read
										{/if}
									</p>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<aside class="blog-metrics">
			<section class="metrics-card">
				<p class="kicker uppercase font-sans text-small">Publishing Stats</p>
				<div class="metrics-grid font-sans">
					<div class="metric">
						<span class="text-small">Total Posts</span>
						<strong>{data.metrics.totalPosts}</strong>
					</div>
					<div class="metric">
						<span class="text-small">Featured</span>
						<strong>{data.metrics.featuredPosts}</strong>
					</div>
				</div>
				{#if data.metrics.latestPublishedAt}
					<p class="metrics-note text-small text-muted">
						Latest post: {fullDate.format(new Date(data.metrics.latestPublishedAt))}
					</p>
				{/if}
			</section>

			<section class="metrics-card">
				<p class="kicker uppercase font-sans text-small">Posts / Month</p>
				<div class="month-chart font-sans">
					{#each monthlyCounts as bucket (bucket.label)}
						<div class="month-row">
							<span class="month-label text-small text-muted">{bucket.label}</span>
							<div class="month-bar-track">
								<div
									class="month-bar"
									style={`width: ${Math.max((bucket.count / maxMonthlyCount) * 100, bucket.count > 0 ? 12 : 0)}%`}
								></div>
							</div>
							<span class="month-count text-small">{bucket.count}</span>
						</div>
					{/each}
				</div>
				<p class="metrics-note text-small text-muted">
					Window ends {compactDate.format(new Date())}
				</p>
			</section>
		</aside>
	</div>
</main>

<style>
	.blog-page {
		margin-bottom: var(--spacing-xl);
	}

	.blog-header {
		padding-bottom: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.blog-header h2 {
		font-size: var(--step-4);
		margin-bottom: var(--spacing-sm);
		text-wrap: balance;
	}

	.kicker {
		margin-bottom: var(--spacing-xs);
	}

	.blog-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.7fr) minmax(260px, 1fr);
		gap: var(--spacing-lg);
		align-items: start;
	}

	.auth-warning {
		border: var(--hairline);
		padding: 0.5rem 0.7rem;
		background: color-mix(in srgb, var(--surface-1) 84%, var(--accent) 16%);
		box-shadow: var(--shadow-sm);
		margin-bottom: var(--spacing-md);
	}

	.blog-metrics {
		position: sticky;
		top: var(--spacing-md);
		display: grid;
		gap: var(--spacing-sm);
	}

	.metrics-card {
		border: var(--hairline);
		padding: var(--spacing-sm);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--surface-elevated) 90%, var(--accent) 10%),
			var(--surface-1)
		);
		box-shadow: var(--shadow-sm);
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem;
	}

	.metric {
		display: grid;
		gap: 0.2rem;
		padding: 0.35rem;
		border: var(--hairline);
		background: color-mix(in srgb, var(--surface-1) 90%, var(--accent) 10%);
	}

	.metric strong {
		font-size: 1.3rem;
		line-height: 1;
	}

	.metrics-note {
		margin: var(--spacing-xs) 0 0;
	}

	.month-chart {
		display: grid;
		gap: 0.35rem;
	}

	.month-row {
		display: grid;
		grid-template-columns: 2.4rem 1fr 1.2rem;
		align-items: center;
		gap: 0.4rem;
	}

	.month-bar-track {
		height: 0.5rem;
		border: var(--hairline);
		background: var(--bg-color);
	}

	.month-bar {
		height: 100%;
		background: color-mix(in srgb, var(--accent) 72%, var(--text-color));
	}

	.post-list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: var(--hairline);
	}

	.post-item {
		border-bottom: var(--hairline);
		background:
			linear-gradient(
				to right,
				color-mix(in srgb, var(--text-color) 5%, transparent) 0,
				color-mix(in srgb, var(--text-color) 5%, transparent) 84px,
				transparent 84px
			),
			var(--surface-1);
	}

	.post-card {
		display: grid;
		grid-template-columns: 84px 1fr;
		gap: 0;
		color: inherit;
		text-decoration: none;
	}

	.post-card:hover .post-summary h3 {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 4px;
		text-decoration-color: color-mix(in srgb, var(--accent) 70%, transparent);
	}

	.post-card:hover .post-summary {
		background: color-mix(in srgb, var(--surface-1) 82%, var(--accent) 18%);
	}

	.post-index {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-sm) var(--spacing-xs);
		border-right: var(--hairline);
		letter-spacing: 0.1em;
	}

	.post-summary {
		padding: 0.9rem 1.1rem;
	}

	.post-summary h3 {
		margin: 0 0 0.35rem;
		font-size: var(--step-2);
	}

	.post-summary p {
		margin: 0;
	}

	.post-meta {
		margin-top: var(--spacing-xs);
	}

	@media (max-width: 900px) {
		.blog-layout {
			grid-template-columns: 1fr;
		}

		.blog-metrics {
			position: static;
		}

		.post-card {
			grid-template-columns: 68px 1fr;
		}
	}
</style>
