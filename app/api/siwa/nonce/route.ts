import { NextRequest, NextResponse } from "next/server";
import { createSIWANonce } from "@buildersgarden/siwa";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { storeNonce } from "@/lib/nonce-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, agentId, agentRegistry, chainId = 8453 } = body;

    if (!address || agentId === undefined || !agentRegistry) {
      return NextResponse.json(
        { error: "Missing required fields: address, agentId, agentRegistry" },
        { status: 400 }
      );
    }

    const chain = chainId === 84532 ? baseSepolia : base;
    const rpcUrl = chainId === 84532
      ? "https://sepolia.base.org"
      : "https://mainnet.base.org";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = createPublicClient({ chain, transport: http(rpcUrl) }) as any;

    const result = await createSIWANonce(
      { address, agentId: Number(agentId), agentRegistry },
      client
    );

    // Handle captcha_required case
    if (result.status === "captcha_required") {
      return NextResponse.json(result, { status: 400 });
    }

    // Handle failed/rejected auth via SIWAResponse
    if (result.status !== "nonce_issued") {
      return NextResponse.json(
        { error: "Agent not registered or not owned by address", details: result },
        { status: 403 }
      );
    }

    // Store for replay protection
    storeNonce(result.nonce);

    return NextResponse.json({
      nonce: result.nonce,
      issuedAt: result.issuedAt,
    });
  } catch (error: unknown) {
    console.error("[SIWA Nonce Error]", error);
    const message = error instanceof Error ? error.message : "Failed to create nonce";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
