// lib/erc8257.ts
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

export type ToolConfig = {
  toolId: bigint;
  creator: string;
  metadataURI: string;
  manifestHash: string;
  accessPredicate: string;
  registeredAt: bigint;
  accessible?: boolean;
  metadata?: any;
};

export const TOOL_REGISTRY_ADDRESS = "0x7291BbFbC368C2D478eCe1eA30de31F612a34856" as `0x${string}`;

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const TOOL_REGISTRY_ABI = parseAbi([
  "function getTool(uint256 toolId) view returns (tuple(uint256 toolId, address creator, string metadataURI, bytes32 manifestHash, address accessPredicate, uint256 registeredAt))",
  "function getToolsByAgent(uint256 agentId) view returns (uint256[])",
  "function isToolAccessible(uint256 toolId, address caller) view returns (bool)",
]);

export async function getAgentTools(agentId: number): Promise<bigint[]> {
  try {
    return await publicClient.readContract({
      address: TOOL_REGISTRY_ADDRESS,
      abi: TOOL_REGISTRY_ABI,
      functionName: 'getToolsByAgent',
      args: [BigInt(agentId)],
    });
  } catch (e) {
    console.error("getAgentTools error:", e);
    return [];
  }
}

export async function getToolConfig(toolId: bigint): Promise<ToolConfig | null> {
  try {
    const data = await publicClient.readContract({
      address: TOOL_REGISTRY_ADDRESS,
      abi: TOOL_REGISTRY_ABI,
      functionName: 'getTool',
      args: [toolId],
    });

    return {
      toolId: data[0],
      creator: data[1],
      metadataURI: data[2],
      manifestHash: data[3],
      accessPredicate: data[4],
      registeredAt: data[5],
    };
  } catch (e) {
    console.error("getToolConfig error:", e);
    return null;
  }
}

export async function checkToolAccess(toolId: bigint, caller: string): Promise<boolean> {
  try {
    return await publicClient.readContract({
      address: TOOL_REGISTRY_ADDRESS,
      abi: TOOL_REGISTRY_ABI,
      functionName: 'isToolAccessible',
      args: [toolId, caller as `0x${string}`],
    });
  } catch {
    return false;
  }
}

export async function fetchToolMetadata(uri: string): Promise<any> {
  try {
    const url = uri.startsWith("ipfs://") 
      ? `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}` 
      : uri;
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error("Metadata fetch error:", e);
    return null;
  }
}
