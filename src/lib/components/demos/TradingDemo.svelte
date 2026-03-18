<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		active?: boolean;
	}

	const { active = true }: Props = $props();

	// Color system
	const BULL = '#28c840';
	const BEAR = '#e06c75';
	const BULL_DIM = 'rgba(40, 200, 64, 0.4)';
	const BEAR_DIM = 'rgba(224, 108, 117, 0.4)';

	const CANDLE_COUNT = 30;
	const WIDTH = 700;
	const HEIGHT = 360;
	const PADDING_L = 8;
	const PADDING_R = 50;
	const PADDING_T = 16;
	const PRICE_H = HEIGHT * 0.68;
	const VOL_H = HEIGHT * 0.22;
	const GAP = HEIGHT * 0.04;
	const VOL_TOP = PADDING_T + PRICE_H + GAP;
	const CHART_W = WIDTH - PADDING_L - PADDING_R;

	interface Candle {
		open: number;
		close: number;
		high: number;
		low: number;
		volume: number;
	}

	interface OrderRow {
		price: number;
		quantity: number;
	}

	interface TickerInstrument {
		sym: string;
		price: number;
		change: number;
	}

	// GARCH-inspired volatility model
	let volatility = 0.02;
	let trend = 0;

	function nextReturn(): { ret: number; vol: number } {
		const lastReturn = (Math.random() - 0.5) * volatility * 100;
		volatility = volatility * 0.95 + 0.02 * 0.05 + Math.abs(lastReturn / 100) * 0.15;
		volatility = Math.max(0.005, Math.min(volatility, 0.08));
		trend = trend * 0.98 + (Math.random() - 0.5) * 0.005;
		const ret = trend + lastReturn / 100;
		return { ret, vol: volatility };
	}

	function generateCandles(): Candle[] {
		const result: Candle[] = [];
		let price = 150 + Math.random() * 50;
		for (let i = 0; i < CANDLE_COUNT; i++) {
			const { ret, vol } = nextReturn();
			const change = price * ret;
			const open = price;
			const close = price + change;
			const high = Math.max(open, close) + Math.random() * Math.abs(change) * 0.8;
			const low = Math.min(open, close) - Math.random() * Math.abs(change) * 0.8;
			const volume = (0.5 + vol * 20 + Math.random()) * 1_000_000;
			result.push({ open, close, high, low, volume });
			price = close;
		}
		return result;
	}

	const initialCandles = generateCandles();
	let candles = $state<Candle[]>(initialCandles);
	let prevCandles = $state<Candle[]>([...initialCandles]);
	let displayCandles = $state<Candle[]>([...initialCandles]);
	let transitionStart = $state(0);
	let transitioning = $state(false);

	// Ticker instruments
	let instruments = $state<TickerInstrument[]>([
		{ sym: 'AETH', price: 185.42, change: 1.17 },
		{ sym: 'SNVT', price: 94.18, change: -0.83 },
		{ sym: 'PRTO', price: 312.75, change: 2.34 },
		{ sym: 'NURA', price: 47.6, change: -1.45 },
		{ sym: 'VGUE', price: 228.33, change: 0.56 }
	]);

	// Order book
	let bids = $state<OrderRow[]>([]);
	let asks = $state<OrderRow[]>([]);

	function generateOrderBook(midPrice: number) {
		const spread = midPrice * 0.001;
		const newBids: OrderRow[] = [];
		const newAsks: OrderRow[] = [];
		for (let i = 0; i < 8; i++) {
			newBids.push({
				price: midPrice - spread * (i + 1),
				quantity: Math.round((800 - i * 60 + Math.random() * 200) * 10) / 10
			});
			newAsks.push({
				price: midPrice + spread * (i + 1),
				quantity: Math.round((800 - i * 60 + Math.random() * 200) * 10) / 10
			});
		}
		bids = newBids;
		asks = newAsks;
	}

	// Hover state
	let hoveredIndex = $state(-1);

	function lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}

	function easeOutExpo(t: number): number {
		return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
	}

	// Smooth transition animation
	$effect(() => {
		if (!browser || !transitioning) return;

		let raf: number;
		function animate() {
			const elapsed = performance.now() - transitionStart;
			const progress = easeOutExpo(Math.min(elapsed / 300, 1));

			const interpolated = candles.map((target, i) => {
				const prev = prevCandles[i] || target;
				return {
					open: lerp(prev.open, target.open, progress),
					close: lerp(prev.close, target.close, progress),
					high: lerp(prev.high, target.high, progress),
					low: lerp(prev.low, target.low, progress),
					volume: lerp(prev.volume, target.volume, progress)
				};
			});
			displayCandles = interpolated;

			if (progress < 1) {
				raf = requestAnimationFrame(animate);
			} else {
				transitioning = false;
				displayCandles = [...candles];
			}
		}

		raf = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(raf);
	});

	$effect(() => {
		if (!browser || !active) return;
		generateOrderBook(candles[candles.length - 1]?.close ?? 180);

		const id = setInterval(() => {
			prevCandles = [...displayCandles];
			const last = candles[candles.length - 1];
			const { ret, vol } = nextReturn();
			const change = last.close * ret;
			const open = last.close;
			const close = open + change;
			const high = Math.max(open, close) + Math.random() * Math.abs(change) * 0.8;
			const low = Math.min(open, close) - Math.random() * Math.abs(change) * 0.8;
			const volume = (0.5 + vol * 20 + Math.random()) * 1_000_000;
			candles = [...candles.slice(1), { open, close, high, low, volume }];

			transitionStart = performance.now();
			transitioning = true;

			// Update ticker instruments
			instruments = instruments.map((inst) => {
				const delta = (Math.random() - 0.48) * inst.price * 0.003;
				const newPrice = inst.price + delta;
				return {
					...inst,
					price: newPrice,
					change: inst.change + (delta / inst.price) * 100
				};
			});

			// Update order book
			generateOrderBook(close);
		}, 1500);
		return () => clearInterval(id);
	});

	// Derived chart values
	let allPrices = $derived(displayCandles.flatMap((c) => [c.high, c.low]));
	let minPrice = $derived(Math.min(...allPrices));
	let maxPrice = $derived(Math.max(...allPrices));
	let priceRange = $derived(maxPrice - minPrice || 1);
	let maxVolume = $derived(Math.max(...displayCandles.map((c) => c.volume)));

	function yPos(val: number): number {
		return PADDING_T + PRICE_H - ((val - minPrice) / priceRange) * PRICE_H;
	}

	function volY(vol: number): number {
		const h = (vol / maxVolume) * VOL_H;
		return VOL_TOP + VOL_H - h;
	}

	let candleWidth = $derived(CHART_W / CANDLE_COUNT);

	let currentPrice = $derived(displayCandles[displayCandles.length - 1]?.close ?? 0);
	let openPrice = $derived(displayCandles[0]?.open ?? 0);
	let priceChangeAbs = $derived(currentPrice - openPrice);
	let priceChangePct = $derived(openPrice !== 0 ? (priceChangeAbs / openPrice) * 100 : 0);
	let totalVolume = $derived(displayCandles.reduce((sum, c) => sum + c.volume, 0));
	let sessionHigh = $derived(Math.max(...displayCandles.map((c) => c.high)));
	let sessionLow = $derived(Math.min(...displayCandles.map((c) => c.low)));
	let bidAskSpread = $derived(
		asks.length > 0 && bids.length > 0 ? asks[0].price - bids[0].price : 0
	);

	const gridLines = 5;

	function handleChartMouseMove(e: MouseEvent) {
		const svg = (e.currentTarget as HTMLElement).querySelector('svg');
		if (!svg) return;
		const rect = svg.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const svgX = (x / rect.width) * WIDTH;
		const idx = Math.floor((svgX - PADDING_L) / candleWidth);
		hoveredIndex = idx >= 0 && idx < CANDLE_COUNT ? idx : -1;
	}

	function handleChartMouseLeave() {
		hoveredIndex = -1;
	}

	let maxOrderQty = $derived(Math.max(...bids.map((b) => b.quantity), ...asks.map((a) => a.quantity), 1));
</script>

<div class="terminal" style="--bull: {BULL}; --bear: {BEAR}; --bull-dim: {BULL_DIM}; --bear-dim: {BEAR_DIM};">
	<!-- Ticker bar -->
	<div class="ticker-bar">
		<div class="ticker-track" class:animate={active}>
			{#each [...instruments, ...instruments] as inst, i (i)}
				<span class="ticker-item">
					<span class="ticker-sym">{inst.sym}</span>
					<span class="ticker-val" class:up={inst.change >= 0} class:down={inst.change < 0}>
						{inst.change >= 0 ? '+' : ''}{inst.change.toFixed(2)}%
					</span>
				</span>
			{/each}
		</div>
	</div>

	<!-- Price header -->
	<div class="price-header">
		<span class="price-sym">AETH</span>
		<span class="price-current">${currentPrice.toFixed(2)}</span>
		<span class="price-change" class:up={priceChangeAbs >= 0} class:down={priceChangeAbs < 0}>
			{priceChangeAbs >= 0 ? '+' : ''}{priceChangeAbs.toFixed(2)} ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
		</span>
	</div>

	<!-- Main content area -->
	<div class="main-content">
		<!-- Chart -->
		<div
			class="chart-area"
			onmousemove={handleChartMouseMove}
			onmouseleave={handleChartMouseLeave}
			role="img"
			aria-label="Candlestick chart"
		>
			<svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg">
				<!-- Price grid -->
				{#each Array(gridLines + 1) as _, i (i)}
					{@const y = PADDING_T + (PRICE_H / gridLines) * i}
					<line
						x1={PADDING_L}
						y1={y}
						x2={WIDTH - PADDING_R}
						y2={y}
						stroke="var(--color-border-subtle)"
						stroke-width="0.5"
					/>
					<text
						x={WIDTH - PADDING_R + 4}
						y={y + 3}
						font-size="8"
						font-family="var(--font-mono)"
						fill="var(--color-text-muted)"
						opacity="0.5"
					>
						{(maxPrice - (priceRange / gridLines) * i).toFixed(1)}
					</text>
				{/each}

				<!-- Volume separator -->
				<line
					x1={PADDING_L}
					y1={VOL_TOP - 2}
					x2={WIDTH - PADDING_R}
					y2={VOL_TOP - 2}
					stroke="var(--color-border-subtle)"
					stroke-width="0.5"
					stroke-dasharray="4,4"
				/>

				<!-- Volume bars -->
				{#each displayCandles as candle, i (i)}
					{@const x = PADDING_L + i * candleWidth + candleWidth / 2}
					{@const bullish = candle.close >= candle.open}
					<rect
						x={x - candleWidth * 0.35}
						y={volY(candle.volume)}
						width={candleWidth * 0.7}
						height={VOL_TOP + VOL_H - volY(candle.volume)}
						fill={bullish ? BULL : BEAR}
						opacity="0.3"
						rx="0.5"
					/>
				{/each}

				<!-- Candlesticks -->
				{#each displayCandles as candle, i (i)}
					{@const x = PADDING_L + i * candleWidth + candleWidth / 2}
					{@const bullish = candle.close >= candle.open}
					{@const color = bullish ? BULL : BEAR}
					<!-- Wick -->
					<line
						x1={x}
						y1={yPos(candle.high)}
						x2={x}
						y2={yPos(candle.low)}
						stroke={color}
						stroke-width="1"
						opacity="0.6"
					/>
					<!-- Body -->
					<rect
						x={x - candleWidth * 0.3}
						y={yPos(Math.max(candle.open, candle.close))}
						width={candleWidth * 0.6}
						height={Math.max(1, Math.abs(yPos(candle.open) - yPos(candle.close)))}
						fill={color}
						opacity="0.85"
						rx="1"
					/>
				{/each}

				<!-- Hover crosshairs + tooltip -->
				{#if hoveredIndex >= 0 && hoveredIndex < CANDLE_COUNT}
					{@const hx = PADDING_L + hoveredIndex * candleWidth + candleWidth / 2}
					{@const hc = displayCandles[hoveredIndex]}
					{@const hMid = (hc.open + hc.close) / 2}

					<!-- Vertical crosshair -->
					<line
						x1={hx}
						y1={PADDING_T}
						x2={hx}
						y2={VOL_TOP + VOL_H}
						stroke="var(--color-text-muted)"
						stroke-width="0.5"
						stroke-dasharray="3,3"
						opacity="0.5"
					/>
					<!-- Horizontal crosshair -->
					<line
						x1={PADDING_L}
						y1={yPos(hMid)}
						x2={WIDTH - PADDING_R}
						y2={yPos(hMid)}
						stroke="var(--color-text-muted)"
						stroke-width="0.5"
						stroke-dasharray="3,3"
						opacity="0.5"
					/>

					<!-- Tooltip background -->
					{@const tx = hx < WIDTH / 2 ? hx + 10 : hx - 120}
					<rect
						x={tx}
						y={PADDING_T + 4}
						width="110"
						height="75"
						fill="var(--color-surface)"
						stroke="var(--color-border)"
						stroke-width="0.5"
						rx="3"
						opacity="0.95"
					/>
					<text
						x={tx + 6}
						y={PADDING_T + 18}
						font-size="8"
						font-family="var(--font-mono)"
						fill="var(--color-text-muted)"
					>
						O <tspan fill="var(--color-text)">{hc.open.toFixed(2)}</tspan>
					</text>
					<text
						x={tx + 6}
						y={PADDING_T + 30}
						font-size="8"
						font-family="var(--font-mono)"
						fill="var(--color-text-muted)"
					>
						H <tspan fill="var(--color-text)">{hc.high.toFixed(2)}</tspan>
					</text>
					<text
						x={tx + 6}
						y={PADDING_T + 42}
						font-size="8"
						font-family="var(--font-mono)"
						fill="var(--color-text-muted)"
					>
						L <tspan fill="var(--color-text)">{hc.low.toFixed(2)}</tspan>
					</text>
					<text
						x={tx + 6}
						y={PADDING_T + 54}
						font-size="8"
						font-family="var(--font-mono)"
						fill="var(--color-text-muted)"
					>
						C <tspan fill={hc.close >= hc.open ? BULL : BEAR}>{hc.close.toFixed(2)}</tspan>
					</text>
					<text
						x={tx + 6}
						y={PADDING_T + 66}
						font-size="8"
						font-family="var(--font-mono)"
						fill="var(--color-text-muted)"
					>
						Vol <tspan fill="var(--color-text)">{(hc.volume / 1_000_000).toFixed(2)}M</tspan>
					</text>
				{/if}
			</svg>
		</div>

		<!-- Order book -->
		<div class="order-book">
			<div class="ob-header">Order Book</div>
			<div class="ob-section">
				{#each asks.toReversed() as ask (ask.price)}
					<div class="ob-row ask">
						<div
							class="ob-bar ask-bar"
							style="width: {(ask.quantity / maxOrderQty) * 100}%"
						></div>
						<span class="ob-price">{ask.price.toFixed(2)}</span>
						<span class="ob-qty">{ask.quantity.toFixed(0)}</span>
					</div>
				{/each}
			</div>
			<div class="ob-spread">
				Spread: {bidAskSpread.toFixed(2)}
			</div>
			<div class="ob-section">
				{#each bids as bid (bid.price)}
					<div class="ob-row bid">
						<div
							class="ob-bar bid-bar"
							style="width: {(bid.quantity / maxOrderQty) * 100}%"
						></div>
						<span class="ob-price">{bid.price.toFixed(2)}</span>
						<span class="ob-qty">{bid.quantity.toFixed(0)}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Stats bar -->
	<div class="stats-bar">
		<span class="stat">
			<span class="stat-label">AETH</span>
			<span class="stat-value">{currentPrice.toFixed(2)}</span>
		</span>
		<span class="stat">
			<span class="stat-label">CHG</span>
			<span class="stat-value" class:up={priceChangeAbs >= 0} class:down={priceChangeAbs < 0}>
				{priceChangeAbs >= 0 ? '+' : ''}{priceChangeAbs.toFixed(2)}
			</span>
		</span>
		<span class="stat">
			<span class="stat-label">VOL</span>
			<span class="stat-value">{(totalVolume / 1_000_000).toFixed(1)}M</span>
		</span>
		<span class="stat">
			<span class="stat-label">HIGH</span>
			<span class="stat-value">{sessionHigh.toFixed(2)}</span>
		</span>
		<span class="stat">
			<span class="stat-label">LOW</span>
			<span class="stat-value">{sessionLow.toFixed(2)}</span>
		</span>
		<span class="stat spread-stat">
			<span class="stat-label">SPREAD</span>
			<span class="stat-value">{bidAskSpread.toFixed(2)}</span>
		</span>
	</div>
</div>

<style>
	.terminal {
		background: var(--color-bg-subtle);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.ticker-bar {
		padding: 0.35rem 0;
		border-bottom: 1px solid var(--color-border-subtle);
		overflow: hidden;
		white-space: nowrap;
	}

	.ticker-track {
		display: inline-flex;
		gap: 1.5rem;
		padding: 0 1rem;
	}

	.ticker-track.animate {
		animation: scroll-ticker 25s linear infinite;
	}

	.ticker-item {
		display: inline-flex;
		gap: 0.4rem;
		font-size: 0.6rem;
		font-family: var(--font-mono);
	}

	.ticker-sym {
		color: var(--color-text-muted);
	}

	.ticker-val.up {
		color: var(--bull);
	}
	.ticker-val.down {
		color: var(--bear);
	}

	.price-header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.35rem 0.75rem;
		padding: 0.5rem 1rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.price-sym {
		font-size: 0.75rem;
		font-family: var(--font-mono);
		font-weight: 600;
		color: var(--color-text);
	}

	.price-current {
		font-size: 1.1rem;
		font-family: var(--font-mono);
		font-weight: 600;
		color: var(--color-text);
	}

	.price-change {
		font-size: 0.7rem;
		font-family: var(--font-mono);
	}

	.price-change.up {
		color: var(--bull);
	}
	.price-change.down {
		color: var(--bear);
	}

	.main-content {
		display: flex;
		flex: 1;
		min-height: 0;
	}

	.chart-area {
		flex: 1;
		padding: 0.25rem;
		cursor: crosshair;
	}

	svg {
		width: 100%;
		height: 100%;
	}

	/* Order Book */
	.order-book {
		width: 160px;
		border-left: 1px solid var(--color-border-subtle);
		display: flex;
		flex-direction: column;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		overflow: hidden;
	}

	.ob-header {
		padding: 0.35rem 0.5rem;
		color: var(--color-text-muted);
		font-size: 0.6rem;
		border-bottom: 1px solid var(--color-border-subtle);
		text-align: center;
	}

	.ob-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0.15rem 0;
	}

	.ob-row {
		display: flex;
		justify-content: space-between;
		padding: 0.1rem 0.5rem;
		position: relative;
	}

	.ob-bar {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
	}

	.ask-bar {
		background: var(--bear-dim);
	}

	.bid-bar {
		background: var(--bull-dim);
	}

	.ob-price {
		position: relative;
		z-index: 1;
	}

	.ob-qty {
		position: relative;
		z-index: 1;
		color: var(--color-text-muted);
	}

	.ask .ob-price {
		color: var(--bear);
	}

	.bid .ob-price {
		color: var(--bull);
	}

	.ob-spread {
		text-align: center;
		padding: 0.2rem;
		color: var(--color-text-muted);
		font-size: 0.55rem;
		border-top: 1px solid var(--color-border-subtle);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.stats-bar {
		display: flex;
		gap: 1rem;
		padding: 0.4rem 1rem;
		border-top: 1px solid var(--color-border-subtle);
		flex-wrap: wrap;
	}

	.stat {
		display: flex;
		gap: 0.35rem;
		font-size: 0.6rem;
		font-family: var(--font-mono);
	}

	.stat-label {
		color: var(--color-text-muted);
	}

	.stat-value {
		color: var(--color-text);
	}

	.stat-value.up {
		color: var(--bull);
	}
	.stat-value.down {
		color: var(--bear);
	}

	@keyframes scroll-ticker {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (max-width: 500px) {
		.order-book {
			display: none;
		}

		.spread-stat {
			display: none;
		}

		.stats-bar {
			gap: 0.5rem 0.75rem;
			padding: 0.4rem 0.75rem;
		}

		.price-header {
			gap: 0.25rem 0.5rem;
			padding: 0.4rem 0.75rem;
		}
	}
</style>
