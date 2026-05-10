import { NextRequest, NextResponse } from 'next/server';
import { createSIWANonce } from "@buildersgarden/siwa";

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const { nonce, issuedAt } = await createSIWANonce({
      address,
      // agentId ve registry opsiyonel olabilir
    });

    return NextResponse.json({ nonce, issuedAt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create nonce" }, { status: 500 });
  }
}
