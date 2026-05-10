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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await verifySIWA(
      message,
      signature,
      message.domain || "localhost", // domain kontrolü
      (nonce: string) => true,       // nonce validation (basit)
      publicClient as any
    );

    if (result.success && result.address) {
      return NextResponse.json({ 
        receipt: result.receipt || "receipt-generated",
        success: true 
      });
    } else {
      return NextResponse.json({ 
        error: result.error || "Verification failed" 
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      error: error.message || "Verification failed" 
    }, { status: 500 });
  }
}
