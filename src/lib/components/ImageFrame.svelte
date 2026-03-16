<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		aspect?: string;
	}

	const { src, alt, aspect = '16/9' }: Props = $props();

	let loaded = $state(false);
</script>

<figure class="image-frame" style:aspect-ratio={aspect}>
	<img
		{src}
		{alt}
		loading="lazy"
		decoding="async"
		class:loaded
		onload={() => (loaded = true)}
	/>
</figure>

<style>
	.image-frame {
		overflow: hidden;
		border-radius: var(--radius-md);
		background-color: var(--color-bg-subtle);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity var(--transition-base);
	}

	img.loaded {
		opacity: 1;
	}
</style>
