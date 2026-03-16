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

	const channels = [
		{ label: 'L', color: '#e06c75', phase: 0 },
		{ label: 'M', color: '#e5c07b', phase: 2 },
		{ label: 'R', color: '#61afef', phase: 4 },
	];

	function faderPos(phase: number): number {
		return 0.3 + Math.sin(tick * 0.04 + phase) * 0.25 + Math.sin(tick * 0.07 + phase * 1.5) * 0.1;
	}

	function ledCount(phase: number): number {
		return Math.round(faderPos(phase) * 8);
	}
</script>

<div class="mixer">
	<div class="header">
		<span class="header-label">MIXER</span>
		<span class="header-ch">3 CH</span>
	</div>
	<div class="channels">
		{#each channels as ch}
			{@const pos = faderPos(ch.phase)}
			{@const leds = ledCount(ch.phase)}
			<div class="channel">
				<div class="track">
					<div class="track-rail"></div>
					<div
						class="handle"
						style:bottom="{pos * 100}%"
						style:background={ch.color}
					></div>
				</div>
				<div class="leds">
					{#each Array(8) as _, i}
						<div
							class="led"
							class:on={i < leds}
							style:background={i < leds ? ch.color : 'var(--color-border-subtle)'}
						></div>
					{/each}
				</div>
				<span class="ch-label">{ch.label}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.mixer {
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

	.channels {
		flex: 1;
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		padding: 1rem 0.75rem 0.75rem;
		min-height: 0;
	}

	.channel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		max-width: 3rem;
	}

	.track {
		flex: 1;
		width: 4px;
		position: relative;
		min-height: 0;
	}

	.track-rail {
		position: absolute;
		inset: 0;
		background: var(--color-border-subtle);
		border-radius: 2px;
	}

	.handle {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		width: 12px;
		height: 6px;
		border-radius: 2px;
		transition: bottom 200ms ease;
	}

	.leds {
		display: flex;
		gap: 2px;
	}

	.led {
		width: 4px;
		height: 4px;
		border-radius: 1px;
		opacity: 0.4;
		transition: opacity 150ms ease, background 150ms ease;
	}

	.led.on {
		opacity: 0.9;
	}

	.ch-label {
		font-family: var(--font-mono);
		font-size: 0.55rem;
		color: var(--color-text-muted);
	}
</style>
