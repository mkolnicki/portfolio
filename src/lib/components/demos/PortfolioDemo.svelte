<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		active?: boolean;
	}

	const { active = true }: Props = $props();

	let tick = $state(0);

	$effect(() => {
		if (!browser || !active) return;
		const id = setInterval(() => {
			tick++;
		}, 2000);
		return () => clearInterval(id);
	});

	const colors = ['var(--color-accent)', '#e06c75', '#61afef', '#e5c07b', '#98c379'];
	let activeColor = $derived(colors[tick % colors.length]);
</script>

<div class="browser">
	<div class="chrome">
		<div class="dots">
			<span class="dot dot--red"></span>
			<span class="dot dot--yellow"></span>
			<span class="dot dot--green"></span>
		</div>
		<div class="address-bar">portfolio.dev</div>
	</div>
	<div class="viewport">
		<!-- Nav -->
		<div class="mock-nav">
			<div class="mock-logo"></div>
			<div class="mock-nav-links">
				<div class="mock-nav-link"></div>
				<div class="mock-nav-link"></div>
				<div class="mock-nav-link"></div>
			</div>
		</div>

		<!-- Hero area -->
		<div class="mock-hero">
			<div class="mock-heading" class:pulse={active}></div>
			<div class="mock-subheading"></div>
		</div>

		<!-- Color swatches -->
		<div class="mock-swatches">
			{#each colors as color, i (color)}
				<div
					class="swatch"
					class:active={tick % colors.length === i}
					style:background={color}
					style:transition-delay="{i * 60}ms"
				></div>
			{/each}
		</div>

		<!-- Content blocks -->
		<div class="mock-grid">
			<div class="mock-card" class:reveal={active} style:--delay="0ms">
				<div class="card-img" style:background={activeColor}></div>
				<div class="card-lines">
					<div class="card-line"></div>
					<div class="card-line short"></div>
				</div>
			</div>
			<div class="mock-card" class:reveal={active} style:--delay="120ms">
				<div class="card-img"></div>
				<div class="card-lines">
					<div class="card-line"></div>
					<div class="card-line short"></div>
				</div>
			</div>
			<div class="mock-card" class:reveal={active} style:--delay="240ms">
				<div class="card-img"></div>
				<div class="card-lines">
					<div class="card-line"></div>
					<div class="card-line short"></div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.browser {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		aspect-ratio: 4 / 3;
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 1rem;
		background: var(--color-bg-subtle);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.dots {
		display: flex;
		gap: 0.35rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.dot--red { background: #ff5f57; }
	.dot--yellow { background: #febc2e; }
	.dot--green { background: #28c840; }

	.address-bar {
		flex: 1;
		font-size: 0.65rem;
		font-family: var(--font-mono);
		color: var(--color-text-muted);
		background: var(--color-bg);
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-subtle);
	}

	.viewport {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.mock-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.mock-logo {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		background: var(--color-accent);
		opacity: 0.6;
	}

	.mock-nav-links {
		display: flex;
		gap: 0.5rem;
	}

	.mock-nav-link {
		width: 32px;
		height: 6px;
		border-radius: 3px;
		background: var(--color-border);
	}

	.mock-hero {
		text-align: center;
		padding: 0.75rem 0;
	}

	.mock-heading {
		width: 60%;
		height: 12px;
		margin: 0 auto 0.5rem;
		border-radius: 4px;
		background: var(--color-text);
		opacity: 0.3;
		transition: opacity 800ms ease;
	}

	.mock-heading.pulse {
		animation: pulse 2s ease-in-out infinite;
	}

	.mock-subheading {
		width: 40%;
		height: 8px;
		margin: 0 auto;
		border-radius: 3px;
		background: var(--color-text-muted);
		opacity: 0.2;
	}

	.mock-swatches {
		display: flex;
		gap: 0.4rem;
		justify-content: center;
	}

	.swatch {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		opacity: 0.3;
		transform: scale(0.85);
		transition: opacity 400ms ease, transform 400ms var(--ease-spring);
	}

	.swatch.active {
		opacity: 1;
		transform: scale(1);
	}

	.mock-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.6rem;
	}

	.mock-card {
		background: var(--color-bg);
		border: 1px solid var(--color-border-subtle);
		border-radius: 6px;
		overflow: hidden;
		opacity: 0;
		transform: translateY(6px);
		transition: opacity 500ms ease var(--delay, 0ms), transform 500ms var(--ease-out-expo) var(--delay, 0ms);
	}

	.mock-card.reveal {
		opacity: 1;
		transform: translateY(0);
	}

	.card-img {
		height: 36px;
		background: var(--color-border-subtle);
		transition: background 800ms ease;
	}

	.card-lines {
		padding: 0.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.card-line {
		height: 4px;
		border-radius: 2px;
		background: var(--color-border);
		opacity: 0.5;
	}

	.card-line.short {
		width: 60%;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.6; }
	}
</style>
