<script lang="ts">
	import { onMount } from 'svelte';
	import type { Project } from '$lib/utils/content';

	let { projects }: { projects: Project[] } = $props();

	function buildMessages(projectList: Project[]): string[] {
		const msgs: string[] = [];
		for (const project of projectList) {
			msgs.push(`> LOADING ${project.title}...`);
			if (project.tags.length) {
				msgs.push(`> STACK: ${project.tags.join(', ')}`);
			}
			msgs.push(`> STATUS: DEPLOYED`);
		}
		return msgs;
	}

	const messages = buildMessages(projects);

	let displayedText = $state("");
	let currentIndex = 0;
	let charIndex = 0;
	let timeout: ReturnType<typeof setTimeout>;

	function typeNext() {
		if (currentIndex >= messages.length) {
			timeout = setTimeout(() => {
				displayedText = "";
				currentIndex = 0;
				charIndex = 0;
				typeNext();
			}, 3000);
			return;
		}

		if (charIndex === 0 && displayedText.length > 0) {
			displayedText += "\n";
		}

		const currentMsg = messages[currentIndex];

		if (charIndex < currentMsg.length) {
			displayedText += currentMsg[charIndex];
			charIndex++;
			const speed = Math.random() * 50 + 20;
			timeout = setTimeout(typeNext, speed);
		} else {
			currentIndex++;
			charIndex = 0;
			timeout = setTimeout(typeNext, 400);
		}
	}

	onMount(() => {
		timeout = setTimeout(typeNext, 1000);
		return () => clearTimeout(timeout);
	});
</script>

<div class="feature-card">
	<div class="feature-card__header">
		<h3 class="feature-card__title">Project Telemetry</h3>
		<p class="feature-card__subtitle">Live deployment feed</p>
		<div class="live-feed">
			<span class="pulse-dot"></span>
			<span>LIVE FEED</span>
		</div>
	</div>

	<div class="terminal">
		<div class="terminal__content">
			{#each displayedText.split('\n') as line, i}
				{#if i > 0 || line.length > 0}
					<div class="terminal__line">{line}</div>
				{/if}
			{/each}
			<span class="terminal__cursor">_</span>
		</div>
	</div>
</div>

<style>
	.feature-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-2xl);
		padding: 2rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		box-shadow: 0 12px 32px rgba(0,0,0,0.3);
		position: relative;
	}

	.feature-card__header {
		margin-bottom: 2rem;
		position: relative;
	}

	.feature-card__title {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-lg);
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.feature-card__subtitle {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.live-feed {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--color-accent);
		letter-spacing: 0.05em;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--color-accent);
		border-radius: 100px;
	}

	.pulse-dot {
		width: 6px;
		height: 6px;
		background-color: var(--color-accent);
		border-radius: 50%;
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.4; transform: scale(0.8); }
		100% { opacity: 1; transform: scale(1); }
	}

	.terminal {
		background: var(--color-bg-subtle);
		flex: 1;
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		overflow: hidden;
		display: flex;
		flex-direction: column-reverse;
	}

	.terminal__content {
		white-space: pre-wrap;
		word-break: break-all;
		line-height: 1.6;
	}

	.terminal__line {
		min-height: 1.6em;
	}

	.terminal__cursor {
		color: var(--color-accent);
		animation: blink 1s step-end infinite;
		font-weight: 700;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}
</style>
