<script lang="ts">
	import { onMount } from 'svelte';
	import type { BlogPost, Project } from '$lib/utils/content';

	let { posts, projects }: { posts: BlogPost[]; projects: Project[] } = $props();

	// Collect unique tags from all posts and projects
	const allTags = [...new Set([
		...posts.flatMap(p => p.tags),
		...projects.flatMap(p => p.tags)
	])];

	// Calculate grid dimensions to fit all tags
	const gridCols = 7;
	const gridRows = Math.max(2, Math.ceil(allTags.length / gridCols));
	const totalCells = gridRows * gridCols;

	let activeCells = $state<number[]>([]);
	let cursorPos = $state({ x: 90, y: 90 });
	let cursorActive = $state(false);

	function getCellCenter(row: number, col: number) {
		const x = (col / (gridCols - 1)) * 100;
		const y = (row / (gridRows - 1)) * 100;
		return { x, y };
	}

	onMount(() => {
		// Build a sequence that visits each tag cell
		const tagCells = allTags.map((_, i) => ({
			row: Math.floor(i / gridCols),
			col: i % gridCols
		}));

		let step = 0;
		let timeoutId: ReturnType<typeof setTimeout>;

		function runSequence() {
			if (step >= tagCells.length) {
				timeoutId = setTimeout(() => {
					activeCells = [];
					cursorPos = { x: 90, y: 90 };
					step = 0;
					timeoutId = setTimeout(runSequence, 2000);
				}, 2000);
				return;
			}

			const target = tagCells[step];
			cursorPos = getCellCenter(target.row, target.col);

			timeoutId = setTimeout(() => {
				cursorActive = true;
				const cellIndex = target.row * gridCols + target.col;

				timeoutId = setTimeout(() => {
					if (!activeCells.includes(cellIndex)) {
						activeCells = [...activeCells, cellIndex];
					}
					cursorActive = false;
					step++;
					timeoutId = setTimeout(runSequence, 500);
				}, 200);
			}, 600);
		}

		timeoutId = setTimeout(runSequence, 1000);
		return () => clearTimeout(timeoutId);
	});
</script>

<div class="feature-card">
	<div class="feature-card__header">
		<h3 class="feature-card__title">Topic Map</h3>
		<p class="feature-card__subtitle">Areas of focus</p>
	</div>

	<div class="grid-container">
		<div class="commit-grid" style="grid-template-rows: repeat({gridRows}, 1fr);">
			{#each Array(totalCells) as _, i}
				<div class="grid-cell" class:grid-cell--active={activeCells.includes(i)} class:grid-cell--tag={i < allTags.length}>
					{#if i < allTags.length}
						<span class="grid-cell__label">{allTags[i]}</span>
					{/if}
				</div>
			{/each}

			<div
				class="cursor"
				class:cursor--active={cursorActive}
				style="left: {cursorPos.x}%; top: {cursorPos.y}%;"
			>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M5.5 3.5L19.5 10.5L11.5 12.5L9.5 20.5L5.5 3.5Z" fill="var(--color-text)" stroke="var(--color-bg)" stroke-width="1.5" stroke-linejoin="round"/>
				</svg>
			</div>
		</div>
	</div>
</div>

<style>
	.feature-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-2xl);
		padding: 2rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		box-shadow: 0 12px 32px rgba(0,0,0,0.3);
	}

	.feature-card__header {
		margin-bottom: 2rem;
	}

	.feature-card__title {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-lg);
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.feature-card__subtitle {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.grid-container {
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.commit-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.5rem;
		flex: 1;
		position: relative;
	}

	.grid-cell {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		transition: background-color 300ms ease, border-color 300ms ease;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.grid-cell__label {
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		color: var(--color-text-muted);
		text-align: center;
		line-height: 1.2;
		padding: 0.125rem;
		transition: color 300ms ease;
	}

	.grid-cell--active {
		background: var(--color-accent);
		border-color: var(--color-accent-hover);
		box-shadow: 0 0 10px rgba(201, 168, 76, 0.2);
	}

	.grid-cell--active .grid-cell__label {
		color: var(--color-bg);
		font-weight: 600;
	}

	.cursor {
		position: absolute;
		width: 24px;
		height: 24px;
		transform: translate(-2px, -2px);
		transition: left 600ms cubic-bezier(0.34, 1.56, 0.64, 1),
					top 600ms cubic-bezier(0.34, 1.56, 0.64, 1),
					transform 150ms ease;
		pointer-events: none;
		z-index: 10;
		filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
	}

	.cursor--active {
		transform: translate(-2px, -2px) scale(0.8);
	}
</style>
