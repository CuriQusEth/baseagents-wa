// app/api/siwa/nonce/route.ts
import { NextRequest } from 'next/server';
import { createSIWANonce } from "@buildersgarden/siwa";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { createMemorySIWANonceStore } from "@buildersgarden/siwa/nonce-store";

const nonceStore = createMemorySIWANonceStore();

const publicClient = createPublicClient({
  chain: base,           // Mainnet kullanıyorsan base, test için baseSepolia
  transport: http(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, agentId } = body;

    if (!address || agentId === undefined) {
      return Response.json({ error: "address ve agentId zorunludur" }, { status: 400 });
    }

    const result = await createSIWANonce(
      {
        address: address as `0x${string}`,
        agentId: Number(agentId),
        agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        chainId: 8453,
      },
      publicClient,
      { nonceStore }
    );

    return Response.json({
      nonce: result.nonce,
      issuedAt: result.issuedAt,
    });
  } catch (error: any) {
    console.error("Nonce Error:", error);
    return Response.json({ error: error.message || "Nonce oluşturulamadı" }, { status: 500 });
  }
}
