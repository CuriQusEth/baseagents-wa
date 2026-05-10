import { NextRequest, NextResponse } from 'next/server';
import { createReceipt } from "@buildersgarden/siwa/receipt";

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return NextResponse.json({ error: "Message and signature required" }, { status: 400 });
    }

    // Gerçek receipt oluştur
    const receiptResult = createReceipt({
      address: message.address || "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
      agentId: message.agentId || 47294,
      agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
      chainId: message.chainId || 8453,
      verified: 'offline'
    }, {
      secret: process.env.SIWA_SECRET || "default_super_secret_key"
    });

    return NextResponse.json({ 
      receipt: receiptResult.receipt,
      success: true 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
