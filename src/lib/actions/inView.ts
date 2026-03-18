export function inView(
	node: HTMLElement,
	options?: { threshold?: number; onChange?: (visible: boolean) => void }
) {
	const threshold = options?.threshold ?? 0.2;
	const onChange = options?.onChange;

	const observer = new IntersectionObserver(
		([entry]) => {
			onChange?.(entry.isIntersecting);
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
