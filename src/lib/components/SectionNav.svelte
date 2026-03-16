<script lang="ts">
	interface NavItem {
		id: string;
		title: string;
	}

	interface NavGroup {
		label: string;
		items: NavItem[];
	}

	interface Props {
		groups: NavGroup[];
		activeId: string | null;
		visible: boolean;
	}

	const { groups, activeId, visible }: Props = $props();

	function scrollToItem(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<nav class="section-nav" class:visible>
	{#each groups as group (group.label)}
		<div class="section-nav__group">
			<span class="section-nav__label">{group.label}</span>
			<div class="section-nav__track">
				{#each group.items as item (item.id)}
					<button
						class="section-nav__item"
						class:active={activeId === item.id}
						onclick={() => scrollToItem(item.id)}
					>
						<span class="section-nav__dot"></span>
						<span class="section-nav__text">{item.title}</span>
					</button>
				{/each}
			</div>
		</div>
	{/each}
</nav>

<style>
	.section-nav {
		position: fixed;
		left: 1.25rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 20;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--transition-base);
	}

	.section-nav.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.section-nav__group {
		display: flex;
		flex-direction: column;
	}

	.section-nav__label {
		font-size: 0.5625rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-bottom: 0.25rem;
		padding-left: 0.125rem;
		opacity: 0.5;
	}

	.section-nav__track {
		--dot-size: 7px;
		display: flex;
		flex-direction: column;
		position: relative;
		padding-left: calc(var(--dot-size) / 2);
	}

	.section-nav__track::before {
		content: '';
		position: absolute;
		left: calc(var(--dot-size) / 2 - 0.5px);
		top: 0.5rem;
		bottom: 0.5rem;
		width: 1px;
		background: var(--color-border);
	}

	.section-nav__item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0 0.3rem 0.625rem;
		border: none;
		background: none;
		cursor: pointer;
		font-family: inherit;
		position: relative;
	}

	.section-nav__dot {
		position: absolute;
		left: calc(-1 * var(--dot-size) / 2);
		width: var(--dot-size);
		height: var(--dot-size);
		border-radius: 50%;
		border: 1.5px solid var(--color-border);
		background: var(--color-bg);
		flex-shrink: 0;
		transition:
			border-color var(--transition-base),
			background-color var(--transition-base),
			box-shadow var(--transition-base);
	}

	.section-nav__item.active .section-nav__dot {
		border-color: var(--color-accent);
		background: var(--color-accent);
		box-shadow: 0 0 8px color-mix(in srgb, var(--color-accent) 30%, transparent);
	}

	.section-nav__item:hover .section-nav__dot {
		border-color: var(--color-accent);
	}

	.section-nav__text {
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--color-text-muted);
		white-space: nowrap;
		opacity: 0.6;
		transition:
			color var(--transition-base),
			opacity var(--transition-base);
	}

	.section-nav__item.active .section-nav__text {
		color: var(--color-text);
		opacity: 1;
	}

	.section-nav__item:hover .section-nav__text {
		color: var(--color-accent);
		opacity: 1;
	}

	@media (max-width: 768px) {
		.section-nav {
			display: none;
		}
	}
</style>
