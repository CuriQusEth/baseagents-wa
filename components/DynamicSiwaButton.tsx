'use client';

import { useState } from 'react';
import { signSIWAMessage } from "@buildersgarden/siwa";
import { createWalletClientSigner } from "@buildersgarden/siwa/signer";
import { useAccount, useWalletClient } from 'wagmi';

export default function DynamicSiwaButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [receipt, setReceipt] = useState<string>("");

  // Kullanıcı girdileri
  const [agentId, setAgentId] = useState<number>(47294);
  const [uri, setUri] = useState<string>("https://myagent.example.com");

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleSignIn = async () => {
    if (!walletClient || !address) {
      alert("Lütfen cüzdanınızı bağlayın");
      return;
    }

    if (!uri.startsWith("http")) {
      alert("Geçerli bir URI girin (https:// ile başlamalı)");
      return;
    }

    setIsLoading(true);

    try {
      const domain = new URL(uri).hostname;

      const nonceRes = await fetch("/api/siwa/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const { nonce, issuedAt } = await nonceRes.json();

      const signer = createWalletClientSigner(walletClient);

      const { message, signature } = await signSIWAMessage({
        domain,
        uri: uri,
        agentId: agentId,
        agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        chainId: 8453,
        nonce,
        issuedAt,
      }, signer);

      const verifyRes = await fetch("/api/siwa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      const data = await verifyRes.json();

      if (data.receipt) {
        setReceipt(data.receipt);
        setAuthenticated(true);
        console.log("✅ Agent Authenticated", { agentId, uri, receipt: data.receipt });
        alert(`Agent #${agentId} başarıyla doğrulandı!`);
      } else {
        alert("Authentication failed");
      }
    } catch (error: any) {
      console.error(error);
      alert("Hata: " + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!authenticated ? (
        <>
          <div>
            <label className="block text-sm mb-1">Agent ID</label>
            <input
              type="number"
              value={agentId}
              onChange={(e) => setAgentId(Number(e.target.value))}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Agent URI / Website</label>
            <input
              type="text"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="https://myagent.example.com"
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl border border-cyan-500 hover:bg-cyan-500/10 transition-all text-lg font-medium disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In with Agent"}
          </button>
        </>
      ) : (
        <div className="text-center space-y-3">
          <div className="text-green-500 text-2xl">✅ Agent Authenticated</div>
          <p className="text-zinc-400">Agent ID: #{agentId}</p>
          <p className="text-zinc-400 text-sm break-all">URI: {uri}</p>
          
          <button 
            onClick={() => setAuthenticated(false)}
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            Sign In Again
          </button>
        </div>
      )}
    </div>
  );
}
