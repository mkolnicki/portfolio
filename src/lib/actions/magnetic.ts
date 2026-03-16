export function magnetic(node: HTMLElement, options?: { strength?: number }) {
	const strength = options?.strength ?? 10;
	
	function handleMouseMove(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		
		node.style.transform = `translate(${x / strength}px, ${y / strength}px) scale(1.03)`;
	}
	
	function handleMouseLeave() {
		node.style.transform = `translate(0px, 0px) scale(1)`;
	}
	
	node.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
	
	node.addEventListener('mousemove', handleMouseMove);
	node.addEventListener('mouseleave', handleMouseLeave);
	
	return {
		destroy() {
			node.removeEventListener('mousemove', handleMouseMove);
			node.removeEventListener('mouseleave', handleMouseLeave);
		}
	};
}
