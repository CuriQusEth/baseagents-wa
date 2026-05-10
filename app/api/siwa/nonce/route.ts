// app/api/siwa/nonce/route.ts
import { NextRequest } from 'next/server';
import { createSIWANonce } from "@buildersgarden/siwa";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { createMemorySIWANonceStore } from "@buildersgarden/siwa/nonce-store";

const nonceStore = createMemorySIWANonceStore();

const publicClient = createPublicClient({
  chain: base,                    // Mainnet için base, test için baseSepolia kullan
  transport: http(),
});

export async function POST(req: NextRequest) {
  try {
    const { address, agentId, agentRegistry } = await req.json();

    if (!address || !agentId) {
      return Response.json({ error: "address ve agentId zorunludur" }, { status: 400 });
    }

    const result = await createSIWANonce(
      {
        address: address as `0x${string}`,
        agentId: Number(agentId),
        agentRegistry: agentRegistry || "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        chainId: 8453,
      },
      publicClient,
      { nonceStore }
    );

    return Response.json({
      nonce: result.nonce,
      issuedAt: result.issuedAt,
      expirationTime: result.expirationTime,
    });
  } catch (error: any) {
    console.error("Nonce Error:", error);
    return Response.json({ error: error.message || "Nonce oluşturulamadı" }, { status: 500 });
  }
}
