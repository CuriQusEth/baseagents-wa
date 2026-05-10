import { verifySIWA } from "@buildersgarden/siwa";
import { corsJson, siwaOptions } from "@buildersgarden/siwa/next";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL || "https://sepolia.base.org"),
});

export async function POST(req: Request) {
  try {
    const { message, signature } = await req.json();

    // Verify SIWA message
    const result = await verifySIWA(
      message,
      signature,
      "myagent.example.com", // This should dynamically map to domain
      async (nonce) => true, // In production, validate from nonceStore
      client
    );

    return corsJson({
      success: true,
      receipt: result.receipt,
      agentId: result.agent?.id
    });
  } catch (error: any) {
    return corsJson({ success: false, error: error.message || "Verification failed" }, { status: 400 });
  }
}

export { siwaOptions as OPTIONS };
