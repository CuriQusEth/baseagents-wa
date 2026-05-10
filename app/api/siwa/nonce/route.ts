import { createSIWANonce } from "@buildersgarden/siwa";
import { corsJson, siwaOptions } from "@buildersgarden/siwa/next";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL || "https://sepolia.base.org"),
});

// Simple in-memory nonce store (use Redis in production)
const nonceStore = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const { address, agentId, agentRegistry } = await req.json();

    const result = await createSIWANonce(
      { address, agentId, agentRegistry },
      client,
    );

    // Store nonce for verification
    nonceStore.set(result.nonce, Date.now());

    return corsJson({
      nonce: result.nonce,
      issuedAt: result.issuedAt,
      expirationTime: result.expirationTime,
    });
  } catch (error: any) {
    return corsJson({ error: error.message || "Failed to create nonce" }, { status: 500 });
  }
}

// ✅ Next.js 15: OPTIONS bir fonksiyon olmalı
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": (siwaOptions as any)?.origin ?? "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
