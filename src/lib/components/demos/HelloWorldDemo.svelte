<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		active?: boolean;
	}

	const { active = true }: Props = $props();

	const lines = [
		{ tokens: [{ text: '<', color: 'var(--color-text-muted)' }, { text: 'script', color: '#e06c75' }, { text: ' lang', color: '#e5c07b' }, { text: '=', color: 'var(--color-text-muted)' }, { text: '"ts"', color: '#98c379' }, { text: '>', color: 'var(--color-text-muted)' }] },
		{ tokens: [{ text: '  let ', color: '#c678dd' }, { text: 'count', color: '#e06c75' }, { text: ' = ', color: 'var(--color-text-muted)' }, { text: '$state', color: '#61afef' }, { text: '(', color: 'var(--color-text-muted)' }, { text: '0', color: '#d19a66' }, { text: ');', color: 'var(--color-text-muted)' }] },
		{ tokens: [{ text: '</', color: 'var(--color-text-muted)' }, { text: 'script', color: '#e06c75' }, { text: '>', color: 'var(--color-text-muted)' }] },
		{ tokens: [] },
		{ tokens: [{ text: '<', color: 'var(--color-text-muted)' }, { text: 'button', color: '#e06c75' }, { text: ' onclick', color: '#e5c07b' }, { text: '={', color: 'var(--color-text-muted)' }, { text: '() => count++', color: '#61afef' }, { text: '}>', color: 'var(--color-text-muted)' }] },
		{ tokens: [{ text: '  Clicks: ', color: '#98c379' }, { text: '{count}', color: '#e5c07b' }] },
		{ tokens: [{ text: '</', color: 'var(--color-text-muted)' }, { text: 'button', color: '#e06c75' }, { text: '>', color: 'var(--color-text-muted)' }] },
	];

	let charCount = $state(0);
	const totalChars = lines.reduce((sum, l) => sum + l.tokens.reduce((s, t) => s + t.text.length, 0), 0);

	$effect(() => {
		if (!browser || !active) return;
		const id = setInterval(() => {
			charCount = (charCount + 1) % (totalChars + 20);
		}, 60);
		return () => clearInterval(id);
	});

	function getVisibleText(lineIdx: number, tokenIdx: number): string {
		let consumed = 0;
		for (let l = 0; l < lines.length; l++) {
			for (let t = 0; t < lines[l].tokens.length; t++) {
				const len = lines[l].tokens[t].text.length;
				if (l === lineIdx && t === tokenIdx) {
					const remaining = charCount - consumed;
					if (remaining <= 0) return '';
					return lines[l].tokens[t].text.slice(0, remaining);
				}
				consumed += len;
			}
		}
		return '';
	}
</script>

<div class="editor">
	<div class="chrome">
		<div class="dots">
			<span class="dot dot--red"></span>
			<span class="dot dot--yellow"></span>
			<span class="dot dot--green"></span>
		</div>
		<span class="filename">App.svelte</span>
	</div>
	<div class="code">
		{#each lines as line, li}
			<div class="line">
				<span class="line-num">{li + 1}</span>
				<span class="line-content">
					{#each line.tokens as token, ti}
						<span style:color={token.color}>{getVisibleText(li, ti)}</span>
					{/each}
				</span>
			</div>
		{/each}
		<div class="cursor" class:blink={active}></div>
	</div>
</div>

<style>
	.editor {
		width: 100%;
		height: 100%;
		background: #1e1e2e;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-bg-subtle);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.dots {
		display: flex;
		gap: 0.3rem;
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
	}

	.dot--red { background: #ff5f57; }
	.dot--yellow { background: #febc2e; }
	.dot--green { background: #28c840; }

	.filename {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--color-text-muted);
	}

	.code {
		flex: 1;
		padding: 0.75rem 0;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		line-height: 1.6;
		position: relative;
	}

	.line {
		display: flex;
		padding: 0 0.75rem;
		min-height: 1.6em;
	}

	.line-num {
		width: 1.5rem;
		text-align: right;
		margin-right: 0.75rem;
		color: var(--color-text-muted);
		opacity: 0.3;
		flex-shrink: 0;
		user-select: none;
	}

	.line-content {
		white-space: pre;
	}

	.cursor {
		display: inline-block;
		width: 1px;
		height: 0.85em;
		background: var(--color-accent);
		position: absolute;
		bottom: 1.5rem;
		right: 40%;
	}

	.cursor.blink {
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}
</style>
