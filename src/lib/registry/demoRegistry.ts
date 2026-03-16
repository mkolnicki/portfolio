import TradingDemo from '$lib/components/demos/TradingDemo.svelte';
import ParticleNetwork from '$lib/components/ParticleNetwork.svelte';
import ClassHierarchy from '$lib/components/ClassHierarchy.svelte';
import NuraHealthDemo from '$lib/components/demos/NuraHealthDemo.svelte';
import ProtocolAlphaDemo from '$lib/components/demos/ProtocolAlphaDemo.svelte';
import VogueDigitalDemo from '$lib/components/demos/VogueDigitalDemo.svelte';
import HelloWorldDemo from '$lib/components/demos/HelloWorldDemo.svelte';
import NoiseProtocolDemo from '$lib/components/demos/NoiseProtocolDemo.svelte';
import StateManagementEdgeDemo from '$lib/components/demos/StateManagementEdgeDemo.svelte';
import type { Component } from 'svelte';

const registry: Record<string, Component<{ active?: boolean }>> = {
	'aether-interface': TradingDemo,
	'interactive-particle-networks': ParticleNetwork,
	'inheritance-as-abstraction': ClassHierarchy,
	'nura-health': NuraHealthDemo,
	'protocol-alpha': ProtocolAlphaDemo,
	'vogue-digital': VogueDigitalDemo,
	'hello-world': HelloWorldDemo,
	'noise-protocol': NoiseProtocolDemo,
	'state-management-edge': StateManagementEdgeDemo
};

export function getDemoComponent(slug: string): Component<{ active?: boolean }> | undefined {
	return registry[slug];
}
