'use client';

import { useState } from 'react';
import { signSIWAMessage } from "@buildersgarden/siwa";
import { createWalletClientSigner } from "@buildersgarden/siwa/signer";
import { useAccount, useWalletClient } from 'wagmi';

export default function DynamicSiwaButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [agentId, setAgentId] = useState(47294);
  const [agentUri, setAgentUri] = useState("https://myagent.example.com");

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleSignIn = async () => {
    if (!walletClient || !address) {
      setError("Cüzdan bağlı değil");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const domain = new URL(agentUri).hostname;

      const nonceRes = await fetch("/api/siwa/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, agentId, agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" }),
      });

      const { nonce, issuedAt } = await nonceRes.json();

      const signer = createWalletClientSigner(walletClient);

      const { message: siwaMessage, signature } = await signSIWAMessage({
        domain,
        uri: agentUri,
        agentId,
        agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        chainId: 8453,
        nonce,
        issuedAt,
      }, signer);

      const verifyRes = await fetch("/api/siwa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: siwaMessage, signature }),
      });

      const data = await verifyRes.json();

      if (data.success && data.receipt) {
        setSuccess(true);
        console.log("✅ Success - Receipt:", data.receipt);
      } else {
        throw new Error(data.error || "Doğrulama başarısız");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return <div className="text-green-500 text-2xl text-center">✅ Agent Authenticated</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <input
        type="number"
        value={agentId}
        onChange={(e) => setAgentId(Number(e.target.value))}
        className="w-full p-4 bg-zinc-900 rounded-xl text-black"
        placeholder="Agent ID"
      />
      <input
        type="text"
        value={agentUri}
        onChange={(e) => setAgentUri(e.target.value)}
        className="w-full p-4 bg-zinc-900 rounded-xl text-black"
        placeholder="https://myagent.com"
      />
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full py-4 bg-blue-600 rounded-xl font-semibold"
      >
        {isLoading ? "Signing..." : "Sign In with Agent"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
