// app/api/siwa/nonce/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    const nonce = `siwa_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const issuedAt = new Date().toISOString();

    return NextResponse.json({ nonce, issuedAt });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

