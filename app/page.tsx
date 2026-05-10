"use client";

import dynamic from 'next/dynamic';
import { ConnectButton } from "@rainbow-me/rainbowkit";

const DynamicSiwaButton = dynamic(
  () => import('@/components/DynamicSiwaButton'),
  { ssr: false }
);

export default function SIWAPage() {
  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
      <div className="siwa-nav">
        <div style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.5px" }}>SIWA Hub</div>
        <ConnectButton />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <DynamicSiwaButton />
      </div>
    </main>
  );
}
