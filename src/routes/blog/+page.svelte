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
		<h2 class="page-title">Engineering Notes</h2>
		<p class="page-deck text-muted">
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
				<ul class="toc-list">
					{#each data.posts as post, index (post.slug)}
						<li class="toc-item">
							<a class="toc-link" href={resolve('/blog/[slug]', { slug: post.slug })}>
								<div class="toc-row">
									<span class="toc-title">{post.title}</span>
									<span class="toc-dots"></span>
									<span class="toc-number font-sans">{String(index + 1).padStart(2, '0')}</span>
								</div>
								<div class="toc-meta text-muted">
									<p class="toc-desc">{post.excerpt}</p>
									<span class="toc-date font-sans text-small">
										{fullDate.format(new Date(post.publishedAt))}
										{#if post.readingMinutes}
											· {post.readingMinutes} min read
										{/if}
									</span>
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

	.page-title {
		font-size: var(--step-4);
		line-height: var(--leading-tight);
		margin-bottom: var(--spacing-sm);
		text-wrap: balance;
	}

	.page-deck {
		font-size: var(--step-0);
		line-height: var(--leading-copy);
		max-width: 68ch;
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

	.toc-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--spacing-lg);
	}

	.toc-link {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		color: inherit;
		text-decoration: none;
		padding: var(--spacing-xs) 0;
		outline: none;
	}

	.toc-link:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 6px;
	}

	.toc-row {
		display: flex;
		align-items: baseline;
		width: 100%;
	}

	.toc-title {
		font-size: var(--step-2);
		font-weight: 500;
		line-height: 1.1;
		transition: color var(--duration-fast) var(--ease-standard);
	}

	.toc-dots {
		flex-grow: 1;
		border-bottom: 2px dotted color-mix(in srgb, var(--border-color) 30%, transparent);
		margin: 0 0.5rem;
		position: relative;
		top: -0.2em;
		transition: border-bottom-color var(--duration-fast) var(--ease-standard);
	}

	.toc-number {
		font-size: var(--step-0);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.05em;
		color: var(--muted-text);
		transition: color var(--duration-fast) var(--ease-standard);
	}

	.toc-meta {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.toc-desc {
		margin: 0;
		max-width: 68ch;
		font-size: var(--step-0);
		line-height: var(--leading-copy);
	}

	.toc-date {
		margin: 0;
	}

	.toc-link:hover .toc-title {
		color: var(--accent);
	}

	.toc-link:hover .toc-dots {
		border-bottom-color: var(--border-color);
	}

	.toc-link:hover .toc-number {
		color: var(--text-color);
	}

	@media (max-width: 900px) {
		.blog-layout {
			grid-template-columns: 1fr;
		}

		.blog-metrics {
			position: static;
		}
	}
</style>
