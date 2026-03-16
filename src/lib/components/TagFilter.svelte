<script lang="ts">
	interface Props {
		tags: string[];
		activeTag: string | null;
		onchange: (tag: string | null) => void;
	}

	const { tags, activeTag, onchange }: Props = $props();
</script>

<div class="tag-filter" role="group" aria-label="Filter by tag">
	<button
		class="tag-filter__pill"
		class:active={activeTag === null}
		onclick={() => onchange(null)}
	>
		All
	</button>
	{#each tags as tag (tag)}
		<button
			class="tag-filter__pill"
			class:active={activeTag === tag}
			onclick={() => onchange(activeTag === tag ? null : tag)}
		>
			{tag}
		</button>
	{/each}
</div>

<style>
	.tag-filter {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag-filter__pill {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.35rem 0.85rem;
		border-radius: 100px;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast),
			border-color var(--transition-fast),
			transform 200ms var(--ease-spring);
	}

	.tag-filter__pill:hover {
		color: var(--color-text);
		border-color: var(--color-border);
		background: var(--color-surface);
	}

	.tag-filter__pill.active {
		background: var(--color-accent);
		color: var(--color-bg);
		border-color: var(--color-accent);
		font-weight: 600;
	}

	.tag-filter__pill:active {
		transform: scale(0.95);
	}
</style>
