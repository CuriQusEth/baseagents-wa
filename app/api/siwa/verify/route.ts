// app/api/siwa/verify/route.ts
import { NextRequest } from 'next/server';
import { verifySIWA } from "@buildersgarden/siwa";
import { createReceipt } from "@buildersgarden/siwa/receipt";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { createMemorySIWANonceStore } from "@buildersgarden/siwa/nonce-store";

const nonceStore = createMemorySIWANonceStore();

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();

    if (!message || !signature) {
      return Response.json({ error: "message ve signature zorunludur" }, { status: 400 });
    }

    const host = req.headers.get("host") || "baseagentt.vercel.app";

    const result = await verifySIWA(
      message,
      signature,
      host,
      { nonceStore },
      publicClient,
      {
        allowedSignerTypes: ["eoa", "sca"],   // Hem normal hem akıllı cüzdanlara izin ver
        mustBeActive: true,
      }
    );

    if (!result.valid) {
      return Response.json({ error: result.error || "Doğrulama başarısız" }, { status: 401 });
    }

    // Receipt oluştur
    const { receipt } = createReceipt({
      address: result.address,
      agentId: result.agentId,
      agentRegistry: result.agentRegistry,
      chainId: result.chainId,
      signerType: result.signerType,
      verified: true,
    }, {
      secret: process.env.RECEIPT_SECRET!,
    });

    return Response.json({
      success: true,
      receipt,
      agentId: result.agentId,
      address: result.address,
      signerType: result.signerType,
    });
  } catch (error: any) {
    console.error("Verify Error:", error);
    return Response.json({ error: error.message || "Doğrulama hatası" }, { status: 500 });
  }
}
