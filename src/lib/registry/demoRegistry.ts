import TradingDemo from '$lib/components/demos/TradingDemo.svelte';
import ParticleNetwork from '$lib/components/ParticleNetwork.svelte';
import ClassHierarchy from '$lib/components/ClassHierarchy.svelte';
import NuraHealthDemo from '$lib/components/demos/NuraHealthDemo.svelte';
import ProtocolAlphaDemo from '$lib/components/demos/ProtocolAlphaDemo.svelte';
import VogueDigitalDemo from '$lib/components/demos/VogueDigitalDemo.svelte';
import HelloWorldDemo from '$lib/components/demos/HelloWorldDemo.svelte';
import NoiseProtocolDemo from '$lib/components/demos/NoiseProtocolDemo.svelte';
import StateManagementEdgeDemo from '$lib/components/demos/StateManagementEdgeDemo.svelte';
import PipelineDAGDemo from '$lib/components/demos/PipelineDAGDemo.svelte';
import RaftConsensusDemo from '$lib/components/demos/RaftConsensusDemo.svelte';
import ConfidentialityDemo from '$lib/components/demos/ConfidentialityDemo.svelte';
import HashAvalancheDemo from '$lib/components/demos/HashAvalancheDemo.svelte';
import CertChainDemo from '$lib/components/demos/CertChainDemo.svelte';
import RSAKeyDemo from '$lib/components/demos/RSAKeyDemo.svelte';
import AESStateDemo from '$lib/components/demos/AESStateDemo.svelte';
import DHColorDemo from '$lib/components/demos/DHColorDemo.svelte';
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
	'state-management-edge': StateManagementEdgeDemo,
	'pipeline-orchestration': PipelineDAGDemo,
	'raft-consensus': RaftConsensusDemo,
	'cryptography-fundamentals': ConfidentialityDemo,
	'hashing': HashAvalancheDemo,
	'pki': CertChainDemo,
	'rsa': RSAKeyDemo,
	'symmetric-encryption': AESStateDemo,
	'diffie-hellman': DHColorDemo
};

export function getDemoComponent(slug: string): Component<{ active?: boolean }> | undefined {
	return registry[slug];
}
