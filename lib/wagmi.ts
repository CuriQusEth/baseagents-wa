import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base, baseSepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "SIWA Hub",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "c5f59cfa3fe2f73752eaf98d9ba0dbe8",
  chains: [base, baseSepolia],
  ssr: true,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        coinbaseWallet({ appName: "SIWA Hub", preference: "smartWalletOnly" }),
        metaMaskWallet,
        walletConnectWallet,
      ],
    },
  ],
});

export const AGENT_REGISTRY_MAINNET =
  "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
export const AGENT_REGISTRY_TESTNET =
  "eip155:84532:0x8004A818BFB912233c491871b3d84c89A494BD9e";
