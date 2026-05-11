import { verifySIWA } from "@buildersgarden/siwa";
import { corsJson } from "@buildersgarden/siwa/next";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL || "https://sepolia.base.org"),
});

export async function POST(req: Request) {
  try {
    const { message, signature } = await req.json();

    const result: any = await verifySIWA(
      message,
      signature,
      "myagent.example.com",
      async (nonce) => true,
      // @ts-ignore
      client
    );

    return corsJson({
      success: true,
      receipt: result.receipt,
      agentId: result.agent?.id,
    });
  } catch (error: any) {
    return corsJson(
      { success: false, error: error.message || "Verification failed" },
      { status: 400 }
    );
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
