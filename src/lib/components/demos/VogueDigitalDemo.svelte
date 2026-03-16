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
		}, 600);
		return () => clearInterval(id);
	});

	const ITEMS = 6;
	let revealedCount = $derived(Math.min(ITEMS, Math.max(0, tick % (ITEMS + 4))));
	let progress = $derived((revealedCount / ITEMS) * 100);
</script>

<div class="gallery">
	<div class="header">
		<span class="header-title">VOGUE DIGITAL</span>
		<span class="header-count">{revealedCount}/{ITEMS}</span>
	</div>
	<div class="grid">
		{#each Array(ITEMS) as _, i}
			<div class="cell" class:loaded={i < revealedCount}>
				<div class="shimmer" class:hidden={i < revealedCount}></div>
				{#if i < revealedCount}
					<div class="content" style:--hue="{200 + i * 25}"></div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="progress-bar">
		<div class="progress-fill" style:width="{progress}%"></div>
	</div>
</div>

<style>
	.gallery {
		width: 100%;
		height: 100%;
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--color-border-subtle);
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--color-text-muted);
		letter-spacing: 0.05em;
	}

	.grid {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 4px;
		padding: 4px;
		min-height: 0;
	}

	.cell {
		position: relative;
		border-radius: 4px;
		overflow: hidden;
		background: var(--color-border-subtle);
	}

	.shimmer {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.04) 50%,
			transparent 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.shimmer.hidden {
		display: none;
	}

	.content {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			hsl(calc(var(--hue) * 1deg), 30%, 20%) 0%,
			hsl(calc(var(--hue) * 1deg + 30), 25%, 15%) 100%
		);
		animation: fadeIn 400ms ease forwards;
	}

	.progress-bar {
		height: 3px;
		background: var(--color-border-subtle);
	}

	.progress-fill {
		height: 100%;
		background: var(--color-accent);
		transition: width 400ms ease;
		opacity: 0.7;
	}

	@keyframes shimmer {
		0% { background-position: -200% 0; }
		100% { background-position: 200% 0; }
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: scale(1.05); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
