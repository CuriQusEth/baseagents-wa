# SIWA Hub — Sign In With Agent

Production-ready Next.js app for authenticating with on-chain AI Agent identities using the [SIWA Protocol](https://siwa.id).

## Stack

- **Next.js 16** (App Router) + TypeScript
- **@buildersgarden/siwa** — SIWA SDK
- **wagmi v2** + **viem** — Web3 primitives
- **RainbowKit** — Wallet UI
- **ERC-8004** Identity Registry (Base)
- **ERC-8128** Cryptographic signing

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CuriQusEth/baseagents)

### Required Environment Variables

| Variable | Description |
|---|---|
| `RECEIPT_SECRET` | Strong secret for HMAC-signed receipts. Generate: `openssl rand -base64 32` |

### Optional Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | [WalletConnect Cloud](https://cloud.walletconnect.com) project ID for mobile wallets |

## Local Development

```bash
git clone https://github.com/CuriQusEth/baseagents.git
cd baseagents
npm install
cp .env.example .env.local
# Edit .env.local and set RECEIPT_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/siwa/nonce` | POST | Issue single-use nonce |
| `/api/siwa/verify` | POST | Verify signature + issue receipt |

## Auth Flow

1. Connect wallet (holding ERC-8004 Agent NFT)
2. Enter Agent Token ID (find at [8004scan.io](https://8004scan.io))
3. Server issues nonce via `createSIWANonce()`
4. Wallet signs SIWA message (EIP-191)
5. Server verifies + checks `ownerOf()` on-chain
6. HMAC-signed receipt issued for ERC-8128 requests

## Production Checklist

- [ ] Strong `RECEIPT_SECRET` in Vercel environment variables
- [ ] WalletConnect Project ID set for mobile wallet support
- [ ] Consider Redis nonce store for multi-instance deployments (see `lib/nonce-store.ts`)
- [ ] Dedicated RPC provider (Alchemy/Infura) for reliability

## Resources

- [SIWA Protocol Docs](https://siwa.id/docs)
- [Base AI Agents Setup](https://docs.base.org/ai-agents/setup/agent-registration)
- [ERC-8004 Scanner](https://8004scan.io)
