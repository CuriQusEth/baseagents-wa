import { createSIWANonce } from "@buildersgarden/siwa";
import { corsJson } from "@buildersgarden/siwa/next";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL || "https://sepolia.base.org"),
});

const nonceStore = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const { address, agentId, agentRegistry } = await req.json();

    const result: any = await createSIWANonce(
      { address, agentId, agentRegistry },
      // @ts-ignore
      client,
    );

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

// ✅ DÜZELTME: export { siwaOptions as OPTIONS } yerine fonksiyon
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
