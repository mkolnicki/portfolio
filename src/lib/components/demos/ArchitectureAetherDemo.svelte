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
		}, 120);
		return () => clearInterval(id);
	});

	const RINGS = 4;
	const ringRadii = [12, 22, 32, 42];
	const sweepAngle = $derived((tick * 3) % 360);
	const rad = $derived((sweepAngle * Math.PI) / 180);

	interface Dot {
		ring: number;
		angle: number;
		born: number;
	}

	let dots = $state<Dot[]>([]);

	$effect(() => {
		if (!active) return;
		if (tick % 8 === 0 && dots.length < 20) {
			const ring = Math.floor(Math.random() * RINGS);
			const angle = sweepAngle + (Math.random() - 0.5) * 30;
			dots = [...dots, { ring, angle, born: tick }];
		}
		if (dots.length > 0 && dots[0].born < tick - 40) {
			dots = dots.slice(1);
		}
	});
</script>

<div class="radar">
	<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		<!-- Rings -->
		{#each ringRadii as r}
			<circle cx="50" cy="50" {r} fill="none" stroke="var(--color-border-subtle)" stroke-width="0.3" />
		{/each}

		<!-- Cross hairs -->
		<line x1="50" y1="6" x2="50" y2="94" stroke="var(--color-border-subtle)" stroke-width="0.2" />
		<line x1="6" y1="50" x2="94" y2="50" stroke="var(--color-border-subtle)" stroke-width="0.2" />

		<!-- Sweep line -->
		<line
			x1="50"
			y1="50"
			x2={50 + Math.cos(rad) * 44}
			y2={50 + Math.sin(rad) * 44}
			stroke="var(--color-accent)"
			stroke-width="0.5"
			opacity="0.6"
		/>

		<!-- Sweep glow -->
		<path
			d="M50,50 L{50 + Math.cos(rad) * 44},{50 + Math.sin(rad) * 44} A44,44 0 0,0 {50 + Math.cos(rad - 0.4) * 44},{50 + Math.sin(rad - 0.4) * 44} Z"
			fill="var(--color-accent)"
			opacity="0.06"
		/>

		<!-- Dots -->
		{#each dots as dot (dot.born + '-' + dot.ring)}
			{@const age = tick - dot.born}
			{@const dRad = (dot.angle * Math.PI) / 180}
			{@const r = ringRadii[dot.ring]}
			<circle
				cx={50 + Math.cos(dRad) * r}
				cy={50 + Math.sin(dRad) * r}
				r="1.2"
				fill="var(--color-accent)"
				opacity={Math.max(0, 1 - age / 40)}
			/>
		{/each}

		<!-- Center dot -->
		<circle cx="50" cy="50" r="1.5" fill="var(--color-accent)" opacity="0.8" />
	</svg>
</div>

<style>
	.radar {
		width: 100%;
		height: 100%;
		background: var(--color-bg-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	svg {
		width: 100%;
		height: 100%;
	}
</style>
