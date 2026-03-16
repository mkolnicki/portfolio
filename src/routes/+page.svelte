<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import Seo from '$lib/components/Seo.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import CallToAction from '$lib/components/CallToAction.svelte';
	import Carousel from '$lib/components/Carousel.svelte';

	let { data } = $props();
</script>

<Seo />
<Hero />

{#if data.projects.length}
	<div class="sticky-wrapper">
		<section id="projects" class="horizontal-section">
			<div class="horizontal-header container" use:reveal>
				<h2 class="section__title">Projects</h2>
				<p class="section__subtitle">A selection of things I've built.</p>
			</div>
			<Carousel count={data.projects.length}>
				{#snippet children(i)}
					<ProjectCard project={data.projects[i]} />
				{/snippet}
			</Carousel>
		</section>
	</div>
{/if}

{#if data.posts.length}
	<div class="sticky-wrapper">
		<section id="writing" class="horizontal-section">
			<div class="horizontal-header container" use:reveal>
				<h2 class="section__title">Writing</h2>
				<p class="section__subtitle">On software design, web development, and creative coding.</p>
			</div>
			<Carousel count={data.posts.length}>
				{#snippet children(i)}
					<BlogCard post={data.posts[i]} />
				{/snippet}
			</Carousel>
		</section>
	</div>
{/if}

<CallToAction />

<style>
	.section__title {
		font-size: var(--text-2xl);
		font-weight: 600;
	}

	.section__subtitle {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	.sticky-wrapper {
		height: 200vh;
		position: relative;
	}

	.horizontal-section {
		position: sticky;
		top: 0;
		background: var(--color-bg);
		padding: 4rem 0 3rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.horizontal-header {
		margin-bottom: 1.5rem;
	}
</style>
