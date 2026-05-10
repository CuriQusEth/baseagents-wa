'use client';

import { useState } from 'react';
import { signSIWAMessage } from "@buildersgarden/siwa";
import { createWalletClientSigner } from "@buildersgarden/siwa/signer";
import { useAccount, useWalletClient } from 'wagmi';
import { setSiwaData, sendAgentRequest } from '../lib/siwa';

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
        body: JSON.stringify({ address }),
      });

      const { nonce, issuedAt } = await nonceRes.json();

      const signer = createWalletClientSigner(walletClient);

      const { message: siwaMsg, signature } = await signSIWAMessage({
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
        body: JSON.stringify({ 
          message: siwaMsg, 
          signature 
        }),
      });

      const data = await verifyRes.json();

      if (data.success && data.receipt) {
        setSiwaData(data.receipt, signer);   // ← receipt kaydediliyor
        setSuccess(true);
        console.log("✅ Gerçek Receipt alındı:", data.receipt);
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-10 bg-green-950 border border-green-500 rounded-3xl">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl text-green-400 mb-2">Agent Authenticated</h2>
        <p className="text-zinc-400 mb-6">Agent ID: #{agentId}</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={async () => {
              try {
                const result = await sendAgentRequest("https://httpbin.org/post", {
                  test: "Base Agent SIWA Test",
                  agentId: 47294
                });
                alert("İstek Başarılı! ✅");
                console.log(result);
              } catch (e: any) {
                alert("Hata: " + e.message);
              }
            }}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Test Authenticated Request Gönder
          </button>

          <button 
            onClick={() => setSuccess(false)}
            className="text-cyan-400 underline mt-2"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm mb-2">Agent ID</label>
        <input
          type="number"
          value={agentId}
          onChange={(e) => setAgentId(Number(e.target.value))}
          className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-cyan-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm mb-2">Agent URI (Website)</label>
        <input
          type="text"
          value={agentUri}
          onChange={(e) => setAgentUri(e.target.value)}
          className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-cyan-500 outline-none"
        />
      </div>

      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 rounded-2xl text-lg font-semibold transition"
      >
        {isLoading ? "Signing In..." : "Sign In with Agent"}
      </button>

      {error && <p className="text-red-500 text-center">{error}</p>}
    </div>
  );
}
