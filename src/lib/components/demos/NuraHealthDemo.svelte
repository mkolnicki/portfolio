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
		}, 100);
		return () => clearInterval(id);
	});

	const ECG_POINTS = 60;
	let ecgPath = $derived.by(() => {
		const points: string[] = [];
		for (let i = 0; i < ECG_POINTS; i++) {
			const x = (i / ECG_POINTS) * 100;
			const phase = (i + tick) % ECG_POINTS;
			let y = 50;
			if (phase > 20 && phase < 24) y = 50 - (phase - 20) * 12;
			else if (phase >= 24 && phase < 28) y = 50 + (28 - phase) * 8;
			else if (phase >= 28 && phase < 30) y = 50 - 5;
			points.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
		}
		return points.join(' ');
	});

	const bars = [
		{ label: 'VO2', color: '#61afef', base: 0.72 },
		{ label: 'HRV', color: '#98c379', base: 0.58 },
		{ label: 'CRP', color: '#e5c07b', base: 0.35 },
	];

	function barWidth(base: number): number {
		return Math.min(100, Math.max(10, (base + Math.sin(tick * 0.05 + base * 10) * 0.15) * 100));
	}

	let bpm = $derived(68 + Math.round(Math.sin(tick * 0.03) * 6));
</script>

<div class="dashboard">
	<div class="header">
		<span class="header-label">BIOMARKER PANEL</span>
		<span class="header-bpm">{bpm} BPM</span>
	</div>

	<div class="ecg">
		<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
			<path d={ecgPath} fill="none" stroke="#e06c75" stroke-width="1.5" opacity="0.8" />
		</svg>
	</div>

	<div class="bars">
		{#each bars as bar}
			<div class="bar-row">
				<span class="bar-label">{bar.label}</span>
				<div class="bar-track">
					<div
						class="bar-fill"
						style:width="{barWidth(bar.base)}%"
						style:background={bar.color}
					></div>
				</div>
				<span class="bar-value">{barWidth(bar.base).toFixed(0)}%</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.dashboard {
		width: 100%;
		height: 100%;
		background: var(--color-bg-subtle);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--color-border-subtle);
		font-family: var(--font-mono);
		font-size: 0.6rem;
	}

	.header-label {
		color: var(--color-text-muted);
		letter-spacing: 0.05em;
	}

	.header-bpm {
		color: #e06c75;
	}

	.ecg {
		flex: 1;
		padding: 0.5rem;
		min-height: 0;
	}

	.ecg svg {
		width: 100%;
		height: 100%;
	}

	.bars {
		padding: 0.5rem 0.75rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.bar-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.bar-label {
		font-family: var(--font-mono);
		font-size: 0.55rem;
		color: var(--color-text-muted);
		width: 2rem;
		letter-spacing: 0.05em;
	}

	.bar-track {
		flex: 1;
		height: 6px;
		background: var(--color-border-subtle);
		border-radius: 3px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 200ms ease;
		opacity: 0.7;
	}

	.bar-value {
		font-family: var(--font-mono);
		font-size: 0.55rem;
		color: var(--color-text-muted);
		width: 2rem;
		text-align: right;
	}
</style>
