export interface AgentMetadata {
  name: string;
  description: string;
  image?: string;
  external_url?: string;
}

export async function getAgentMetadata(agentId: number, chainId: number): Promise<AgentMetadata | null> {
  try {
    // Basic placeholder implementation. In a real app this would call an RPC to get tokenURI 
    // or call 8004scan API directly: 
    // const res = await fetch(`https://api.8004scan.io/api/v1/agents/${chainId}/${agentId}`);
    // return await res.json();
    return {
      name: `Agent #${agentId}`,
      description: "On-chain AI Agent identity."
    };
  } catch (error) {
    console.error("Failed to fetch agent metadata:", error);
    return null;
  }
}
