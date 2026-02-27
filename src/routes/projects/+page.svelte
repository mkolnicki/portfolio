<script lang="ts">
	let { data } = $props();

	type Project = (typeof data.projects)[number];
	const compactNumber = new Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 1
	});
	const wholeNumber = new Intl.NumberFormat('en-US');
	let activeProject = $state<Project | null>(null);
	let previewProject = $state<Project | null>(null);
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;
	let previewCloseTimer: ReturnType<typeof setTimeout> | null = null;
	const sparklineWidth = 250;
	const sparklineHeight = 90;
	const sparklinePadding = 8;
	let commitSeries = $derived(data.metrics.weeklyCommits);
	let maxCommitCount = $derived(Math.max(...commitSeries, 1));
	let sparklineStepX = $derived(
		commitSeries.length > 1
			? (sparklineWidth - sparklinePadding * 2) / (commitSeries.length - 1)
			: 0
	);
	let sparklinePoints = $derived(
		commitSeries
			.map((count, index) => {
				const x = sparklinePadding + index * sparklineStepX;
				const y =
					sparklineHeight -
					sparklinePadding -
					(count / maxCommitCount) * (sparklineHeight - sparklinePadding * 2);
				return `${x},${y}`;
			})
			.join(' ')
	);
	let sparklineAreaPoints = $derived(
		`${sparklinePadding},${sparklineHeight - sparklinePadding} ${sparklinePoints} ${
			sparklineWidth - sparklinePadding
		},${sparklineHeight - sparklinePadding}`
	);

	function openReadme(project: Project) {
		cancelHoverPreview();
		cancelPreviewClose();
		previewProject = null;
		activeProject = project;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = 'hidden';
		}
	}

	function closeReadme() {
		activeProject = null;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	function clearPreview(project?: Project) {
		if (!project || previewProject?.id === project.id) {
			previewProject = null;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && activeProject) {
			closeReadme();
		}
	}

	function queueHoverPreview(project: Project) {
		cancelHoverPreview();
		cancelPreviewClose();
		hoverTimer = setTimeout(() => {
			if (!activeProject) {
				previewProject = project;
			}
		}, 250);
	}

	function cancelHoverPreview() {
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
	}

	function schedulePreviewClose(project?: Project) {
		cancelPreviewClose();
		previewCloseTimer = setTimeout(() => {
			clearPreview(project);
		}, 180);
	}

	function cancelPreviewClose() {
		if (previewCloseTimer) {
			clearTimeout(previewCloseTimer);
			previewCloseTimer = null;
		}
	}

	function openPreviewAsDrawer(event: Event) {
		event.preventDefault();
		if (previewProject) {
			openReadme(previewProject);
		}
	}

	function handlePreviewPanelKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			openPreviewAsDrawer(event);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<main class="container projects-page">
	<header class="projects-header thick-bottom">
		<p class="kicker uppercase font-sans text-small">Projects</p>
		<h2>Selected Work</h2>
		<p class="text-muted">
			Live data from <a
				href={`https://github.com/${data.username}`}
				target="_blank"
				rel="noreferrer">@{data.username}</a
			>. The work reflects my focus on backend systems, data pipelines, and practical AI integration.
			Hover to preview a project, or click to open the full README.
		</p>
	</header>

	{#if data.projects.length === 0}
		<p>No projects are currently available.</p>
	{:else}
		<div class="projects-layout">
			<section class="projects-rail">
				<ul class="project-list">
					{#each data.projects as project, index (project.id)}
						<li class="project-item">
							<button
								class="project-card"
								type="button"
								onmouseenter={() => queueHoverPreview(project)}
								onmouseleave={() => {
									cancelHoverPreview();
									schedulePreviewClose(project);
								}}
								onblur={() => {
									cancelHoverPreview();
									clearPreview(project);
								}}
								onclick={() => openReadme(project)}
								aria-label={`Open README for ${project.name}`}
							>
								<span class="project-index font-sans text-small"
									>{String(index + 1).padStart(2, '0')}</span
								>
								<div class="project-summary">
									<h3>{project.name}</h3>
									<p class="text-muted">{project.description}</p>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			</section>

			<aside class="data-desk">
				<section class="data-card">
					<p class="kicker uppercase font-sans text-small">Code Metrics</p>
					<div class="metric-grid font-sans">
						<div class="metric">
							<span class="metric-label text-small">Projects</span>
							<strong>{wholeNumber.format(data.metrics.totalProjects)}</strong>
						</div>
						<div class="metric">
							<span class="metric-label text-small">Stars</span>
							<strong>{compactNumber.format(data.metrics.totalStars)}</strong>
						</div>
						<div class="metric">
							<span class="metric-label text-small">Forks</span>
							<strong>{compactNumber.format(data.metrics.totalForks)}</strong>
						</div>
						<div class="metric">
							<span class="metric-label text-small">Active (30d)</span>
							<strong>{wholeNumber.format(data.metrics.activeLast30Days)}</strong>
						</div>
					</div>
					<p class="metric-footnote text-small text-muted">
						Top language: {data.metrics.topLanguage ?? 'N/A'}
					</p>
				</section>

				<section class="data-card">
					<p class="kicker uppercase font-sans text-small">Commit Activity</p>
					<svg
						class="commit-chart"
						viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`}
						role="img"
						aria-label="Weekly commit activity over the last eight weeks"
					>
						<polyline class="commit-line" points={sparklinePoints}></polyline>
						<polygon class="commit-area" points={sparklineAreaPoints}></polygon>
					</svg>
					<p class="metric-footnote text-small text-muted">
						{wholeNumber.format(data.metrics.totalCommits8Weeks)} commits in the last 8 weeks
					</p>
				</section>

				{#if data.featuredProject}
					<section class="data-card featured-project">
						<p class="kicker uppercase font-sans text-small">Featured Project</p>
						<h3>{data.featuredProject.name}</h3>
						<p class="text-muted">{data.featuredProject.description}</p>
						<div class="featured-meta font-sans text-small">
							<span>{wholeNumber.format(data.featuredProject.stars)} stars</span>
							<span>{wholeNumber.format(data.featuredProject.forks)} forks</span>
						</div>
					</section>
				{/if}
			</aside>
		</div>
	{/if}

	{#if previewProject && !activeProject}
		<div
			class="preview-panel hairline-left"
			aria-label={`Preview for ${previewProject.name}`}
			role="button"
			tabindex="0"
			onmouseenter={cancelPreviewClose}
			onmouseleave={() => schedulePreviewClose(previewProject ?? undefined)}
			onkeydown={handlePreviewPanelKeydown}
			onclick={openPreviewAsDrawer}
		>
			<div class="readme-toolbar font-sans text-small hairline-bottom">
				<h3>{previewProject.name}</h3>
				<span class="text-muted">Preview</span>
			</div>
			<div class="readme-content preview-content">
				{#if previewProject.readmeHtml}
					<article class="readme readme-preview">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html previewProject.readmeHtml}
					</article>
					<p class="preview-hint font-sans text-small text-muted">
						Click the card to open the full README.
					</p>
				{:else}
					<p class="text-muted">No README preview is available for this project.</p>
				{/if}
			</div>
		</div>
	{/if}

	{#if activeProject}
		<div class="readme-modal">
			<button class="modal-backdrop" type="button" aria-label="Close README" onclick={closeReadme}
			></button>
			<div
				class="readme-panel"
				role="dialog"
				aria-modal="true"
				aria-label={`README for ${activeProject.name}`}
				tabindex="-1"
			>
				<div class="readme-toolbar font-sans text-small hairline-bottom">
					<h3>{activeProject.name}</h3>
					<div class="project-links">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a class="repo-link" href={activeProject.repoUrl} target="_blank" rel="noreferrer">
							<svg class="repo-icon" viewBox="0 0 24 24" aria-hidden="true">
								<path
									fill="currentColor"
									d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.2c-3.4.7-4.1-1.5-4.1-1.5a3.2 3.2 0 0 0-1.3-1.8c-1.1-.7.1-.7.1-.7a2.5 2.5 0 0 1 1.8 1.2 2.5 2.5 0 0 0 3.4 1 2.5 2.5 0 0 1 .8-1.5c-2.7-.3-5.5-1.4-5.5-6A4.7 4.7 0 0 1 5.4 9a4.4 4.4 0 0 1 .1-3.1s1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2a4.4 4.4 0 0 1 .1 3.1 4.7 4.7 0 0 1 1.2 3.2c0 4.6-2.8 5.6-5.5 6a2.8 2.8 0 0 1 .8 2.2v3.2c0 .4.2.7.8.6A12 12 0 0 0 12 .5Z"
								></path>
							</svg>
							<span>Repository</span>
						</a>
						{#if activeProject.homepage}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={activeProject.homepage} target="_blank" rel="noreferrer">Live</a>
						{/if}
						<button class="close-btn" type="button" onclick={closeReadme} aria-label="Close README">
							Close
						</button>
					</div>
				</div>
				<div class="readme-content">
					{#if activeProject.readmeHtml}
						<article class="readme">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html activeProject.readmeHtml}
						</article>
					{:else}
						<p class="text-muted">No README could be loaded for this project.</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	.projects-page {
		margin-bottom: var(--spacing-xl);
	}

	.projects-header {
		padding-bottom: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.kicker {
		margin-bottom: var(--spacing-xs);
	}

	.projects-header h2 {
		font-size: var(--step-4);
		margin-bottom: var(--spacing-sm);
		text-wrap: balance;
	}

	.project-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		max-width: 980px;
	}

	.projects-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.75fr) minmax(270px, 1fr);
		gap: var(--spacing-lg);
		align-items: start;
	}

	.projects-rail {
		min-width: 0;
	}

	.data-desk {
		position: sticky;
		top: var(--spacing-md);
		display: grid;
		gap: var(--spacing-sm);
	}

	.data-card {
		border: var(--hairline);
		padding: var(--spacing-sm);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--surface-elevated) 90%, var(--accent) 10%),
			var(--surface-1)
		);
		box-shadow: var(--shadow-sm);
	}

	.metric-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem;
		margin-top: var(--spacing-xs);
	}

	.metric {
		display: grid;
		gap: 0.1rem;
		padding: 0.3rem 0.35rem;
		border: var(--hairline);
		background: color-mix(in srgb, var(--surface-1) 90%, var(--accent) 10%);
	}

	.metric-label {
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.metric strong {
		font-size: 1.25rem;
		line-height: 1.05;
	}

	.metric-footnote {
		margin: var(--spacing-xs) 0 0;
	}

	.commit-chart {
		display: block;
		width: 100%;
		height: auto;
		margin-top: var(--spacing-xs);
		border: var(--hairline);
		background: var(--bg-color);
	}

	.commit-line {
		fill: none;
		stroke: var(--text-color);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.commit-area {
		fill: color-mix(in srgb, var(--text-color) 10%, transparent);
	}

	.featured-project h3 {
		margin: var(--spacing-xs) 0;
		font-size: 1.4rem;
	}

	.featured-project p {
		margin-bottom: var(--spacing-sm);
	}

	.featured-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.project-item {
		border-top: var(--hairline);
		border-bottom: var(--hairline);
		margin-top: -1px;
		background:
			linear-gradient(
				to right,
				color-mix(in srgb, var(--text-color) 5%, transparent) 0,
				color-mix(in srgb, var(--text-color) 5%, transparent) 84px,
				transparent 84px
			),
			var(--surface-1);
	}

	.project-index {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: var(--spacing-sm) var(--spacing-xs);
		font-weight: 600;
		letter-spacing: 0.12em;
		opacity: 0.85;
		border-right: var(--hairline);
	}

	.project-summary {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-xs);
		align-items: start;
	}

	.project-summary h3 {
		margin: 0;
		font-size: var(--step-2);
		line-height: 1.05;
	}

	.project-summary p {
		margin: 0;
		max-width: 64ch;
	}

	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		align-items: center;
	}

	.repo-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.repo-icon {
		width: 1rem;
		height: 1rem;
	}

	.preview-panel {
		position: fixed;
		top: 50%;
		right: var(--spacing-md);
		height: min(50vh, 460px);
		width: min(460px, 34vw);
		background: var(--surface-elevated);
		border: var(--hairline);
		border-right: 0;
		display: grid;
		grid-template-rows: auto 1fr;
		z-index: 900;
		animation: slide-in-preview 0.45s ease;
		pointer-events: auto;
		cursor: pointer;
		transform: translateY(-50%);
	}

	.preview-content {
		position: relative;
	}

	.readme-preview {
		column-count: 1;
		max-height: 100%;
		overflow: hidden;
		-webkit-mask-image: linear-gradient(to bottom, black 52%, transparent 100%);
		mask-image: linear-gradient(to bottom, black 52%, transparent 100%);
	}

	.preview-hint {
		position: sticky;
		bottom: 0;
		margin: 0;
		padding: var(--spacing-sm) 0 0;
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--bg-color) 0%, transparent),
			var(--bg-color) 35%
		);
	}

	.readme-modal {
		position: fixed;
		inset: 0;
		z-index: 1000;
		padding: var(--spacing-md);
	}

	.modal-backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		background: color-mix(in srgb, var(--text-color) 14%, transparent);
		backdrop-filter: saturate(0.9);
		cursor: pointer;
	}

	.readme-panel {
		position: relative;
		width: min(900px, 100%);
		height: 100%;
		margin-left: auto;
		background: var(--surface-elevated);
		color: var(--text-color);
		border: var(--hairline);
		box-shadow: var(--shadow-md);
		display: grid;
		grid-template-rows: auto 1fr;
		animation: slide-in-panel 0.45s ease;
	}

	.readme-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
	}

	.readme-toolbar h3 {
		margin: 0;
		font-size: 1.2rem;
	}

	.close-btn {
		background: var(--surface-1);
		color: var(--text-color);
		border: var(--hairline);
		border-radius: 99px;
		padding: 0.2rem 0.6rem;
		cursor: pointer;
	}

	.close-btn:hover {
		background: var(--surface-elevated);
		color: var(--accent);
	}

	.readme-content {
		padding: var(--spacing-md);
		overflow: auto;
	}

	.readme {
		column-count: 1;
		column-gap: var(--spacing-lg);
		text-align: justify;
		hyphens: auto;
	}

	@keyframes slide-in-preview {
		from {
			transform: translateY(-50%) translateX(2rem);
			opacity: 0;
		}
		to {
			transform: translateY(-50%) translateX(0);
			opacity: 1;
		}
	}

	@keyframes slide-in-panel {
		from {
			transform: translateX(2rem);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	:global(.readme h1),
	:global(.readme h2),
	:global(.readme h3),
	:global(.readme h4),
	:global(.readme h5),
	:global(.readme h6) {
		break-after: avoid-column;
	}

	/* Hide GitHub-generated heading permalink anchors ("link") */
	:global(.readme a.anchor),
	:global(.readme .markdown-heading > a:first-child) {
		display: none !important;
	}

	:global(.readme img) {
		max-width: 100%;
		height: auto;
	}

	:global(.readme pre),
	:global(.readme code) {
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
	}

	:global(.readme pre) {
		overflow-x: auto;
		padding: var(--spacing-sm);
		border: var(--hairline);
		background: color-mix(in srgb, var(--bg-color) 92%, var(--text-color));
	}

	.project-card:hover {
		background: color-mix(in srgb, var(--surface-1) 82%, var(--accent) 18%);
	}

	.project-card {
		width: 100%;
		text-align: left;
		background: transparent;
		border: 0;
		color: inherit;
		padding: 0;
		cursor: pointer;
		display: grid;
		grid-template-columns: 84px 1fr;
		align-items: stretch;
		gap: 0;
	}

	.project-card:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: -3px;
	}

	.project-card:hover .project-summary h3 {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 5px;
	}

	.project-card:hover .project-summary {
		background: color-mix(in srgb, var(--surface-1) 82%, var(--accent) 18%);
	}

	.project-summary {
		padding: 0.9rem 1.1rem;
	}

	@media (max-width: 900px) {
		.projects-layout {
			grid-template-columns: 1fr;
		}

		.data-desk {
			position: static;
		}

		.project-list {
			max-width: 100%;
		}

		.project-card {
			grid-template-columns: 68px 1fr;
		}

		.preview-panel {
			height: min(50vh, 420px);
			width: min(100% - 2rem, 560px);
		}

		.readme-toolbar {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
