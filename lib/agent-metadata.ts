export interface AgentMetadata {
  name: string;
  description: string;
  image?: string;
  external_url?: string;
}

export async function getAgentMetadata(agentId: number, chainId: number): Promise<AgentMetadata | null> {
  try {
    return {
      name: `Woodblock Agent #${agentId}`,
      description: "On-chain AI Agent identity for Web3 interactions."
    };
  } catch (error) {
    console.error("Failed to fetch agent metadata:", error);
    return null;
  }
}
