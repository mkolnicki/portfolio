<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import gsap from 'gsap';

	interface Props {
		count: number;
		children: Snippet<[number]>;
	}

	const { count, children }: Props = $props();

	let current = $state(0);
	let viewport: HTMLElement;
	let track: HTMLElement;
	let animating = false;
	let autoTimer: ReturnType<typeof setInterval>;

	// Track has count+1 slides: [0..count-1, clone of 0]
	// "position" is the physical slide index we animate to
	let position = 0;

	function goTo(index: number) {
		if (animating || count === 0) return;
		animating = true;

		const target = ((index % count) + count) % count;
		const slideWidth = viewport.offsetWidth;

		if (target === 0 && current === count - 1) {
			// Going forward past last slide: animate to the clone (position count), then snap
			position = count;
			current = 0;
			gsap.to(track, {
				x: -(position * slideWidth),
				duration: 0.5,
				ease: 'power3.inOut',
				onComplete: () => {
					position = 0;
					gsap.set(track, { x: 0 });
					animating = false;
				}
			});
		} else if (target === count - 1 && current === 0) {
			// Going backward from first slide: snap to clone position, then animate back
			position = count;
			gsap.set(track, { x: -(count * slideWidth) });
			current = count - 1;
			position = count - 1;
			gsap.to(track, {
				x: -(position * slideWidth),
				duration: 0.5,
				ease: 'power3.inOut',
				onComplete: () => {
					animating = false;
				}
			});
		} else {
			current = target;
			position = target;
			gsap.to(track, {
				x: -(position * slideWidth),
				duration: 0.5,
				ease: 'power3.inOut',
				onComplete: () => {
					animating = false;
				}
			});
		}

		resetAuto();
	}

	function next() {
		goTo(current + 1);
	}

	function resetAuto() {
		clearInterval(autoTimer);
		autoTimer = setInterval(next, 2000);
	}

	onMount(() => {
		autoTimer = setInterval(next, 2000);

		const onResize = () => {
			const slideWidth = viewport.offsetWidth;
			gsap.set(track, { x: -(position * slideWidth) });
		};
		window.addEventListener('resize', onResize);

		return () => {
			clearInterval(autoTimer);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<div class="carousel">
	<div class="carousel__viewport" bind:this={viewport}>
		<div class="carousel__track" bind:this={track}>
			{#each Array(count) as _, i (i)}
				<div
					class="carousel__slide"
					role="button"
					tabindex="0"
					onclick={() => next()}
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') next(); }}
				>
					{@render children(i)}
				</div>
			{/each}
			<!-- Clone of first slide for seamless forward looping -->
			<div class="carousel__slide" aria-hidden="true">
				{@render children(0)}
			</div>
		</div>
	</div>
	<div class="carousel__dots">
		{#each Array(count) as _, i (i)}
			<button
				class="carousel__dot"
				class:active={i === current}
				onclick={() => goTo(i)}
				aria-label="Go to slide {i + 1}"
			></button>
		{/each}
	</div>
</div>

<style>
	.carousel {
		width: 100%;
	}

	.carousel__viewport {
		overflow: hidden;
		width: 100%;
	}

	.carousel__track {
		display: flex;
	}

	.carousel__slide {
		flex: 0 0 100%;
		min-width: 0;
		padding: 0 5vw;
		box-sizing: border-box;
		cursor: pointer;
		height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.carousel__slide > :global(*) {
		width: 100%;
		max-width: 1000px;
		height: 100%;
	}

	.carousel__dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}

	.carousel__dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 1px solid var(--color-border);
		background: transparent;
		cursor: pointer;
		padding: 0;
		transition: background 200ms ease, border-color 200ms ease;
	}

	.carousel__dot.active {
		background: var(--color-text);
		border-color: var(--color-text);
	}

	.carousel__dot:hover {
		border-color: var(--color-text-muted);
	}
</style>
