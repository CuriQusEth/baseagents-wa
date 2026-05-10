'use client';

import { useState } from 'react';
import { signSIWAMessage } from "@buildersgarden/siwa";
import { createWalletClientSigner } from "@buildersgarden/siwa/signer";
import { useAccount, useWalletClient } from 'wagmi';

export default function DynamicSiwaButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [agentId, setAgentId] = useState(47294);
  const [agentUri, setAgentUri] = useState("https://your-agent-domain.com");

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleSignIn = async () => {
    if (!walletClient || !address) {
      setStatus("error");
      setMessage("Cüzdan bağlı değil");
      return;
    }

    setIsLoading(true);
    setStatus("idle");

    try {
      const domain = new URL(agentUri).hostname;

      // Nonce al
      const nonceRes = await fetch("/api/siwa/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address }),
      });

      if (!nonceRes.ok) throw new Error("Nonce alınamadı");

      const { nonce, issuedAt } = await nonceRes.json();

      const signer = createWalletClientSigner(walletClient);

      // SIWA Sign
      const { message: siwaMessage, signature } = await signSIWAMessage({
        domain: domain,
        uri: agentUri,
        agentId: agentId,
        agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        chainId: 8453,
        nonce,
        issuedAt,
      }, signer);

      // Verify
      const verifyRes = await fetch("/api/siwa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: siwaMessage, 
          signature 
        }),
      });

      const data = await verifyRes.json();

      if (data.receipt) {
        setStatus("success");
        setMessage(`Agent #${agentId} başarıyla doğrulandı!`);
        console.log("Receipt:", data.receipt);
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {status === "success" ? (
        <div className="text-center p-8 bg-green-950 border border-green-500 rounded-2xl">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-green-400 text-2xl mb-2">Agent Authenticated</h2>
          <p>{message}</p>
          <button 
            onClick={() => setStatus("idle")}
            className="mt-6 text-cyan-400 underline"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label>Agent ID</label>
              <input 
                type="number" 
                value={agentId}
                onChange={(e) => setAgentId(Number(e.target.value))}
                className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label>Agent URI (Website)</label>
              <input 
                type="text" 
                value={agentUri}
                onChange={(e) => setAgentUri(e.target.value)}
                placeholder="https://myagent.com"
                className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-xl"
              />
            </div>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 rounded-2xl text-lg font-semibold"
          >
            {isLoading ? "Signing..." : "Sign In with Agent"}
          </button>

          {status === "error" && <p className="text-red-500 text-center">{message}</p>}
        </>
      )}
    </div>
  );
}
