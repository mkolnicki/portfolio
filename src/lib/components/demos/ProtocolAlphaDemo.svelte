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
		}, 800);
		return () => clearInterval(id);
	});

	const logTemplates = [
		'[INFO] Connection established on port 443',
		'[INFO] TLS handshake complete — cipher: AES-256',
		'[WARN] Latency spike detected: 142ms',
		'[INFO] Packet routed via node alpha-7',
		'[INFO] Certificate verified — SHA-256',
		'[DEBUG] Buffer flush: 2.4KB released',
		'[INFO] Heartbeat ACK received',
		'[WARN] Retry queue depth: 3',
		'[INFO] DNS resolved in 12ms',
		'[INFO] Session token refreshed',
	];

	let visibleLogs = $derived.by(() => {
		const logs: string[] = [];
		for (let i = 0; i < 8; i++) {
			logs.push(logTemplates[(tick + i) % logTemplates.length]);
		}
		return logs;
	});

	const SPARK_POINTS = 20;
	let sparkPath = $derived.by(() => {
		const pts: string[] = [];
		for (let i = 0; i < SPARK_POINTS; i++) {
			const x = (i / (SPARK_POINTS - 1)) * 100;
			const v = Math.sin((i + tick) * 0.5) * 30 + 50 + Math.sin((i + tick) * 1.3) * 10;
			pts.push(`${i === 0 ? 'M' : 'L'}${x},${v}`);
		}
		return pts.join(' ');
	});
</script>

<div class="terminal">
	<div class="chrome">
		<div class="dots">
			<span class="dot dot--red"></span>
			<span class="dot dot--yellow"></span>
			<span class="dot dot--green"></span>
		</div>
		<span class="title">protocol-alpha</span>
	</div>
	<div class="body">
		<div class="logs">
			{#each visibleLogs as log, i (tick + '-' + i)}
				<div class="log-line" class:warn={log.includes('[WARN]')} class:debug={log.includes('[DEBUG]')}>
					{log}
				</div>
			{/each}
		</div>
		<div class="chart">
			<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
				<path d={sparkPath} fill="none" stroke="var(--color-accent)" stroke-width="1.5" opacity="0.7" />
			</svg>
			<span class="chart-label">throughput</span>
		</div>
	</div>
</div>

<style>
	.terminal {
		width: 100%;
		height: 100%;
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: flex;
		flex-direction: column;
		overflow: hidden;
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

	.title {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--color-text-muted);
	}

	.body {
		flex: 1;
		display: flex;
		min-height: 0;
	}

	.logs {
		flex: 1;
		padding: 0.5rem 0.75rem;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.log-line {
		font-family: var(--font-mono);
		font-size: 0.5rem;
		color: var(--color-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		opacity: 0.7;
	}

	.log-line.warn {
		color: #e5c07b;
	}

	.log-line.debug {
		color: #61afef;
		opacity: 0.5;
	}

	.chart {
		width: 35%;
		border-left: 1px solid var(--color-border-subtle);
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
	}

	.chart svg {
		flex: 1;
		width: 100%;
	}

	.chart-label {
		font-family: var(--font-mono);
		font-size: 0.5rem;
		color: var(--color-text-muted);
		text-align: center;
		opacity: 0.5;
		margin-top: 0.25rem;
	}
</style>
