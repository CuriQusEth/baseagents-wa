import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "SIWA Hub",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "siwa-hub-demo",
  chains: [base, baseSepolia],
  ssr: true,
});

export const AGENT_REGISTRY_MAINNET =
  "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
export const AGENT_REGISTRY_TESTNET =
  "eip155:84532:0x8004A818BFB912233c491871b3d84c89A494BD9e";
