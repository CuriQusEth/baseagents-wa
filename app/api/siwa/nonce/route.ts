// app/api/siwa/nonce/route.ts
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
      agentId: agentId || undefined,
      agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
    }, publicClient);

    // Yeni yapıya göre kontrol
    if ('nonce' in result && result.nonce) {
      return NextResponse.json({
        nonce: result.nonce,
        issuedAt: result.issuedAt || new Date().toISOString(),
      });
    } else if (result.status === "captcha_required") {
      return NextResponse.json({
        error: "Captcha required",
        challenge: result.challenge,
        challengeToken: result.challengeToken
      }, { status: 403 });
    } else {
      return NextResponse.json({ 
        error: "Failed to generate nonce" 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Nonce error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create nonce" 
    }, { status: 500 });
  }
}
