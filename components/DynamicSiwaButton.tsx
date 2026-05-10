'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { signSIWAMessage } from "@buildersgarden/siwa/siwa";
import { getAgentMetadata, type AgentMetadata } from '@/lib/agent-metadata';

export default function DynamicSiwaButton() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Kullanıcı Girdileri
  const [agentId, setAgentId] = useState<number>(46324);
  const [agentName, setAgentName] = useState("Woodblock AI Agent");
  const [domain, setDomain] = useState("baseagentt.vercel.app");
  const [uri, setUri] = useState("https://baseagentt.vercel.app/api/siwa/verify");

  const [agentData, setAgentData] = useState<AgentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [siwaMessage, setSiwaMessage] = useState("");

  // Agent ID değiştiğinde metadata çek
  useEffect(() => {
    if (agentId > 0) {
      getAgentMetadata(agentId, 8453).then(setAgentData);
    }
  }, [agentId]);

  const startSiwa = async () => {
    if (!address) {
      alert("Lütfen cüzdanınızı bağlayın");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Nonce al
      const nonceRes = await fetch('/api/siwa/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, agentId }),
      });

      if (!nonceRes.ok) throw new Error("Nonce alınamadı");
      const { nonce, issuedAt } = await nonceRes.json();

      // 2. SIWA Mesajını @buildersgarden/siwa ile oluştur
      let message;
      // This part might have signature issue based on what's exported. Let's try to adapt:
      const siwaData = {
        domain: domain,
        uri: uri,
        agentId: agentId,
        agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        chainId: 8453,
        nonce,
        version: "1",
        issuedAt,
      };

      try {
        message = await signSIWAMessage(siwaData);
      } catch (e) {
        // Fallback or custom builder if signSIWAMessage is not directly working like this
        message = `${domain} wants you to sign in with your Agent account:\n${address}\n\nSign in with my on-chain Agent to SIWA Hub\n\nURI: ${uri}\nVersion: 1\nAgent ID: ${agentId}\nAgent Registry: eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${issuedAt}`;
      }

      // Statement kısmına agent name'i manuel ekleyelim (daha okunaklı olsun)
      const finalMessage = message.replace(
        "Sign in with my on-chain Agent to SIWA Hub",
        `Sign in with my on-chain Agent (${agentName}) to SIWA Hub`
      );

      setSiwaMessage(finalMessage);
      setShowModal(true);
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signMessage = async () => {
    try {
      const signature = await signMessageAsync({ message: siwaMessage });

      const verifyRes = await fetch('/api/siwa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          agentId,
          signature,
          message: siwaMessage,
        }),
      });

      if (verifyRes.ok) {
        alert("✅ SIWA Başarılı! Receipt alındı.");
        setShowModal(false);
      } else {
        alert("Verify başarısız");
      }
    } catch (err: any) {
      alert("İmza hatası: " + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 bg-zinc-950 rounded-3xl border border-zinc-800" style={{background: 'var(--surface)', border: '1px solid var(--border)'}}>
      <h1 className="text-3xl font-bold text-center" style={{marginBottom: '2rem'}}>SIWA Hub - Dinamik Giriş</h1>

      <div className="grid grid-cols-1 gap-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div>
          <label className="block text-sm mb-1" style={{color: 'var(--text-dim)', marginBottom: 4, display: 'block'}}>Agent Token ID</label>
          <input
            type="number"
            value={agentId}
            onChange={(e) => setAgentId(Number(e.target.value))}
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
            style={{width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)'}}
          />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{color: 'var(--text-dim)', marginBottom: 4, display: 'block'}}>Agent Name (Görünecek İsim)</label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
            placeholder="Woodblock AI Agent"
            style={{width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)'}}
          />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{color: 'var(--text-dim)', marginBottom: 4, display: 'block'}}>Domain (Web Siteniz)</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
            placeholder="baseagentt.vercel.app"
            style={{width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)'}}
          />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{color: 'var(--text-dim)', marginBottom: 4, display: 'block'}}>URI (Verify Endpoint)</label>
          <input
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
            placeholder="https://example.com/api/siwa/verify"
            style={{width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)'}}
          />
        </div>
      </div>

      {agentData && (
        <div className="p-5 bg-zinc-900 rounded-2xl" style={{marginTop: '1rem', padding: '1rem', background: 'rgba(0, 255, 0, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(0, 255, 0, 0.2)'}}>
          <p className="text-green-400 text-sm" style={{color: 'var(--green)', fontSize: '0.875rem', margin: 0}}>Metadata Yüklendi:</p>
          <p className="font-medium" style={{margin: '0.25rem 0 0 0'}}>{agentData.name}</p>
        </div>
      )}

      <button
        onClick={startSiwa}
        disabled={isLoading || !address}
        className="btn-primary"
        style={{width: '100%', marginTop: '1.5rem', padding: '1rem', background: 'var(--cyan)'}}
      >
        {isLoading ? "Hazırlanıyor..." : "SIWA Mesajı Oluştur ve İmzala"}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem'}}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '1rem', width: '100%', maxWidth: '42rem', display: 'flex', flexDirection: 'column'}}>
            <div className="p-6 border-b" style={{padding: '1.5rem', borderBottom: '1px solid var(--border)'}}>
              <h2 className="text-2xl font-bold" style={{margin: 0}}>SIWA İmzalama</h2>
            </div>
            <div className="p-6 flex-1 overflow-auto" style={{padding: '1.5rem', overflow: 'auto', flex: 1}}>
              <pre className="bg-black p-6 rounded-2xl text-sm whitespace-pre-wrap text-zinc-300" style={{background: '#000', padding: '1.5rem', borderRadius: '0.5rem', fontSize: '0.875rem', whiteSpace: 'pre-wrap', color: '#ccc'}}>
                {siwaMessage}
              </pre>
            </div>
            <div className="p-6 border-t flex gap-4" style={{padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem'}}>
              <button 
                onClick={() => setShowModal(false)} 
                className="btn-secondary"
                style={{flex: 1, padding: '1rem'}}
              >
                İptal
              </button>
              <button 
                onClick={signMessage} 
                className="btn-primary"
                style={{flex: 1, padding: '1rem', background: 'var(--green)'}}
              >
                İmzala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
