export function reveal(node: HTMLElement, options?: { threshold?: number; delay?: number; distance?: string; duration?: number }) {
	const threshold = options?.threshold ?? 0.15;
	const delay = options?.delay ?? 0;
	const distance = options?.distance ?? '12px';
	const duration = options?.duration ?? 400;

	node.style.opacity = '0';
	node.style.transform = `translateY(${distance})`;
	node.style.transition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		node.style.opacity = '1';
		node.style.transform = 'none';
		return {};
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.style.opacity = '1';
					node.style.transform = 'translateY(0)';
					observer.unobserve(node);
				}
			}
		},
		{ threshold }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
