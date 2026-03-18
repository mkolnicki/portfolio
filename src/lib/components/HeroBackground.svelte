<script lang="ts">
	import { browser } from '$app/environment';

	const SCENE_URL = 'https://my.spline.design/claritystream-t955kHdpxZf0c0E6x0YCvdrA/scene.splinecode';

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let containerEl: HTMLDivElement | undefined = $state();
	let loaded = $state(false);

	$effect(() => {
		if (!browser || !containerEl) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !loaded) {
					loaded = true;
					observer.disconnect();
				}
			},
			{ threshold: 0, rootMargin: '200px' }
		);
		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!browser || !canvasEl || !loaded) return;

		let disposed = false;
		let app: import('@splinetool/runtime').Application | undefined;

		import('@splinetool/runtime').then(({ Application }) => {
			if (disposed) return;
			app = new Application(canvasEl!);
			app.load(SCENE_URL);
		});

		return () => {
			disposed = true;
			app?.dispose();
		};
	});
</script>

<div class="hero-bg" role="presentation" bind:this={containerEl}>
	<canvas bind:this={canvasEl} class="spline-canvas"></canvas>
</div>

<style>
	.hero-bg {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
		pointer-events: auto;
	}

	.spline-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	@media (max-width: 768px) {
		.spline-canvas {
			opacity: 0.5;
		}
	}

	@media (max-width: 480px) {
		.spline-canvas {
			opacity: 0.35;
		}
	}
</style>
