import { NextRequest, NextResponse } from 'next/server';
import { createSIWANonce } from "@buildersgarden/siwa";
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function POST(request: NextRequest) {
  try {
    const { address, agentId } = await request.json();

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const result = await createSIWANonce({
      address,
      agentId: agentId || undefined,        // opsiyonel
      agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
    }, publicClient as any);

    return NextResponse.json({
      nonce: result.nonce,
      issuedAt: result.issuedAt
    });

  } catch (error: any) {
    console.error("Nonce creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create nonce",
      details: error.message 
    }, { status: 500 });
  }
}
