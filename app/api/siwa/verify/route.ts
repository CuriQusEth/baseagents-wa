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

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return Response.json({ error: "message ve signature zorunludur" }, { status: 400 });
    }

    const domain = request.headers.get("host") || "baseagentt.vercel.app";

    const result = await verifySIWA(
      message,
      signature,
      domain,
      { nonceStore },
      publicClient
    );

    if (!result.valid) {
      return Response.json({ 
        error: result.error || "SIWA doğrulaması başarısız oldu" 
      }, { status: 401 });
    }

    // Receipt oluştur
    const { receipt } = createReceipt({
      address: result.address,
      agentId: result.agentId,
      agentRegistry: result.agentRegistry,
      chainId: result.chainId,
      verified: true,
    }, {
      secret: process.env.RECEIPT_SECRET!,
    });

    return Response.json({
      success: true,
      receipt,
      agent: {
        address: result.address,
        agentId: result.agentId,
        chainId: result.chainId,
        signerType: result.signerType,
      }
    });
  } catch (error: any) {
    console.error("Verify Error:", error);
    return Response.json({ 
      error: error.message || "Doğrulama sırasında hata oluştu" 
    }, { status: 500 });
  }
}
