import { NextRequest, NextResponse } from "next/server";
import { verifySIWA } from "@buildersgarden/siwa";
import { createReceipt } from "@buildersgarden/siwa/receipt";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { consumeNonce } from "@/lib/nonce-store";

const RECEIPT_SECRET = process.env.RECEIPT_SECRET ?? "siwa-dev-secret-change-in-production";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, signature, chainId = 8453 } = body;

    if (!message || !signature) {
      return NextResponse.json(
        { error: "Missing required fields: message, signature" },
        { status: 400 }
      );
    }

    const chain = chainId === 84532 ? baseSepolia : base;
    const rpcUrl = chainId === 84532
      ? "https://sepolia.base.org"
      : "https://mainnet.base.org";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = createPublicClient({ chain, transport: http(rpcUrl) }) as any;

    const result = await verifySIWA(
      message,
      signature,
      req.headers.get("host") ?? "localhost:3000",
      (nonce: string) => consumeNonce(nonce),
      client
    );

    if (!result.valid) {
      return NextResponse.json(
        { error: "SIWA verification failed", code: result.code, details: result.error },
        { status: 401 }
      );
    }

    // Issue HMAC receipt for ERC-8128 subsequent requests
    const { receipt, expiresAt } = createReceipt(
      {
        address: result.address,
        agentId: result.agentId,
        agentRegistry: result.agentRegistry,
        chainId: result.chainId,
        verified: result.verified,
        signerType: result.signerType,
      },
      { secret: RECEIPT_SECRET, ttl: 24 * 60 * 60 * 1000 } // 24h
    );

    return NextResponse.json({
      success: true,
      receipt,
      expiresAt,
      agent: {
        address: result.address,
        agentId: result.agentId,
        signerType: result.signerType ?? "eoa",
      },
    });
  } catch (error: unknown) {
    console.error("[SIWA Verify Error]", error);
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
