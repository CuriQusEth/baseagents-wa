import { NextRequest, NextResponse } from 'next/server';
import { verifySIWA } from "@buildersgarden/siwa";
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return NextResponse.json({ error: "Message and signature required" }, { status: 400 });
    }

    const result = await verifySIWA(
      message,
      signature,
      message.domain || new URL(request.url).hostname,
      () => true,                    // Basit nonce kontrolü (sonra geliştirebiliriz)
      publicClient as any
    );

    if (result.success || (result as any).valid) {
      return NextResponse.json({ 
        receipt: result.receipt || "siwa-receipt-" + Date.now(),
        success: true,
        agentId: result.agentId
      });
    } else {
      return NextResponse.json({ error: result.error || "Verification failed" }, { status: 401 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
