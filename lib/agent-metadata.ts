// lib/agent-metadata.ts
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export type AgentMetadata = {
  name: string;
  description: string;
  image?: string;
  endpoints?: any[];
  owner?: string;
  registryCaip: string;
  chainId: number;
  agentId: number;
};

const MAINNET_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const SEPOLIA_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e';

const publicClientMainnet = createPublicClient({
  chain: base,
  transport: http(),
});

const publicClientSepolia = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function getAgentMetadata(
  agentId: number,
  chainId: number = 8453
): Promise<AgentMetadata | null> {
  const isMainnet = chainId === 8453;
  const registryAddress = isMainnet ? MAINNET_REGISTRY : SEPOLIA_REGISTRY;
  const client = isMainnet ? publicClientMainnet : publicClientSepolia;

  try {
    // 1. Önce 8004scan API'yi dene (en hızlı ve zengin veri)
    const scanRes = await fetch(
      `https://8004scan.io/api/v1/public/agents/${chainId}/${agentId}`,
      { cache: 'no-store' }
    );

    if (scanRes.ok) {
      const data = await scanRes.json();
      return {
        name: data.name || `Agent #${agentId}`,
        description: data.description || '',
        image: data.image,
        endpoints: data.endpoints || [],
        owner: data.owner,
        registryCaip: `eip155:${chainId}:${registryAddress}`,
        chainId,
        agentId,
      };
    }

    // 2. API başarısız olursa on-chain tokenURI + metadata çek
    const tokenURI = await client.readContract({
      address: registryAddress as `0x${string}`,
      abi: [
        {
          name: 'tokenURI',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ type: 'uint256' }],
          outputs: [{ type: 'string' }],
        },
      ],
      functionName: 'tokenURI',
      args: [BigInt(agentId)],
    });

    let metadata: any = {};

    if (tokenURI.startsWith('ipfs://')) {
      const url = `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}`;
      const res = await fetch(url);
      metadata = await res.json();
    } else if (tokenURI.startsWith('http')) {
      const res = await fetch(tokenURI);
      metadata = await res.json();
    } else if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64 = tokenURI.split(',')[1];
      metadata = JSON.parse(atob(base64));
    }

    return {
      name: metadata.name || `Agent #${agentId}`,
      description: metadata.description || '',
      image: metadata.image,
      endpoints: metadata.endpoints || [],
      registryCaip: `eip155:${chainId}:${registryAddress}`,
      chainId,
      agentId,
    };
  } catch (error) {
    console.error('Agent metadata fetch error:', error);
    return null;
  }
}
