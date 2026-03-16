<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		active?: boolean;
	}

	const { active = true }: Props = $props();

	const COLS = 24;
	const ROWS = 16;
	const CELL = 100 / COLS;

	let seed = $state(0);

	$effect(() => {
		if (!browser || !active) return;
		const id = setInterval(() => {
			seed++;
		}, 150);
		return () => clearInterval(id);
	});

	function noise(i: number, s: number): number {
		const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
		return x - Math.floor(x);
	}
</script>

<div class="field">
	<svg viewBox="0 0 100 {100 * ROWS / COLS}" xmlns="http://www.w3.org/2000/svg">
		{#each Array(ROWS) as _, r}
			{#each Array(COLS) as _, c}
				{@const idx = r * COLS + c}
				<rect
					x={c * CELL}
					y={r * CELL}
					width={CELL}
					height={CELL}
					fill="var(--color-text)"
					opacity={noise(idx, seed) * 0.25}
				/>
			{/each}
		{/each}
	</svg>
	<div class="label">
		<span class="label-text">NOISE PROTOCOL</span>
		<span class="label-ver">v{seed % 100}</span>
	</div>
</div>

<style>
	.field {
		width: 100%;
		height: 100%;
		background: var(--color-bg-subtle);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	svg {
		flex: 1;
		width: 100%;
		display: block;
	}

	.label {
		display: flex;
		justify-content: space-between;
		padding: 0.4rem 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--color-text-muted);
		border-top: 1px solid var(--color-border-subtle);
	}

	.label-ver {
		opacity: 0.5;
	}
</style>
