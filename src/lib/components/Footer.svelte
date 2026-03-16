<footer class="footer">
	<div class="footer__inner container">
		<div class="footer__brand">
			<span class="footer__logo">MK</span>
			<p class="footer__tagline">Crafting digital instruments.</p>
		</div>
		
		<div class="footer__grid">
			<div class="footer__column">
				<h4 class="footer__heading">Navigation</h4>
				<ul class="footer__links">
					<li><a href="/">Home</a></li>
					<li><a href="/projects">Projects</a></li>
					<li><a href="/blog">Writing</a></li>
				</ul>
			</div>
			<div class="footer__column">
				<h4 class="footer__heading">Connect</h4>
				<ul class="footer__links">
					<li><a href="https://github.com/matthewkolnicki" target="_blank" rel="noopener noreferrer">GitHub</a></li>
					<li><a href="https://linkedin.com/in/matthewkolnicki" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
					<li><a href="https://x.com/matthewkolnicki" target="_blank" rel="noopener noreferrer">X</a></li>
				</ul>
			</div>
		</div>
	</div>

	<div class="footer__bottom container">
		<p class="footer__copy">&copy; {new Date().getFullYear()} Matthew Kolnicki</p>
		<div class="footer__system-status">
			<span class="status-dot"></span>
			<span class="status-text">SYSTEM OPERATIONAL</span>
		</div>
	</div>
</footer>

<style>
	.footer {
		background-color: var(--color-bg-subtle);
		border-top: 1px solid var(--color-border-subtle);
		border-top-left-radius: 4rem;
		border-top-right-radius: 4rem;
		padding-top: 5rem;
		padding-bottom: 2rem;
		margin-top: 4rem;
		display: flex;
		flex-direction: column;
		gap: 4rem;
	}

	.footer__inner {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
	}

	@media (min-width: 768px) {
		.footer__inner {
			grid-template-columns: 1fr 2fr;
		}
	}

	.footer__brand {
		max-width: 16rem;
	}

	.footer__logo {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-2xl);
		color: var(--color-text);
		display: block;
		margin-bottom: 0.5rem;
	}

	.footer__tagline {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.footer__grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
	}

	.footer__heading {
		font-size: 0.75rem;
		font-family: var(--font-mono);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text);
		margin-bottom: 1.5rem;
	}

	.footer__links {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.footer__links a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		transition: color var(--transition-fast);
	}

	.footer__links a:hover {
		color: var(--color-accent);
	}

	.footer__bottom {
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	@media (min-width: 640px) {
		.footer__bottom {
			flex-direction: row;
		}
	}

	.footer__copy {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.footer__system-status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: 100px;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		background-color: #10B981; /* Primary Green */
		border-radius: 50%;
		animation: pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.status-text {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: #10B981;
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	@keyframes pulse-green {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: .3;
		}
	}
</style>
