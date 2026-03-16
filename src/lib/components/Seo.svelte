<script lang="ts">
	interface Props {
		title?: string;
		description?: string;
		image?: string;
		url?: string;
	}

	const { title = 'Matthew Kolnicki', description = 'Software engineer & builder', image, url }: Props = $props();

	const fullTitle = $derived(title === 'Matthew Kolnicki' ? title : `${title} — Matthew Kolnicki`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	{#if image}<meta property="og:image" content={image} />{/if}
	{#if url}<meta property="og:url" content={url} />{/if}
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
