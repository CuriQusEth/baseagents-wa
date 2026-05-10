'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { signSIWAMessage } from "@buildersgarden/siwa";
import { getAgentMetadata, type AgentMetadata } from '@/lib/agent-metadata';
import { createWalletClient, custom } from 'viem';

export default function DynamicSiwaButton() {
  const { address, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Kullanıcı tarafından değiştirilebilir alanlar
  const [agentId, setAgentId] = useState<number>(46324);
  const [agentName, setAgentName] = useState("Woodblock AI Agent");
  const [domain, setDomain] = useState("baseagentt.vercel.app");
  const [uri, setUri] = useState("https://baseagentt.vercel.app/api/siwa/verify");

  const [agentData, setAgentData] = useState<AgentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [siwaMessage, setSiwaMessage] = useState("");
  const [signature, setSignature] = useState(""); // Add local signature state

  // Agent Metadata Çek
  useEffect(() => {
    if (agentId > 0) {
      getAgentMetadata(agentId, 8453).then(setAgentData);
    }
  }, [agentId]);

  const startSiwaFlow = async () => {
    if (!address) {
      alert("Lütfen cüzdanınızı bağlayın");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Nonce Al
      const nonceRes = await fetch('/api/siwa/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, agentId }),
      });

      if (!nonceRes.ok) throw new Error("Nonce alınamadı");
      const { nonce, issuedAt } = await nonceRes.json();

      // 2. SIWA Mesajı Oluştur
      let generatedMessage = "";
      try {
          const res = await signSIWAMessage({
            domain,
            uri,
            agentId,
            agentRegistry: "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
            chainId: 8453,
            nonce,
            issuedAt,
          });
          generatedMessage = res.message || res; // depending on the SDK export structure
      } catch (err) {
          generatedMessage = `${domain} wants you to sign in with your Agent account:\n${address}\n\nSign in with my on-chain Agent to SIWA Hub\n\nURI: ${uri}\nVersion: 1\nAgent ID: ${agentId}\nAgent Registry: eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${issuedAt}`;
      }

      // Handle raw string or Object
      const rawMsg = typeof generatedMessage === "string" ? generatedMessage : (generatedMessage as any).message || String(generatedMessage);

      // Agent ismini mesajın içine ekle
      const finalMessage = rawMsg.replace(
        "Sign in with my on-chain Agent to SIWA Hub",
        `Sign in with my on-chain Agent (${agentName}) to SIWA Hub`
      );

      let currentSig: string;

      // === SMART ACCOUNT DESTEĞİ ===
      if (connector?.getProvider) {
        try {
          const provider = await connector.getProvider();
          const walletClient = createWalletClient({
            chain: { id: 8453, name: 'Base', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['https://mainnet.base.org'] } } },
            transport: custom(provider as any),
          });

          const [account] = await walletClient.getAddresses();
          currentSig = await walletClient.signMessage({
            account,
            message: finalMessage,
          });
        } catch (smartError) {
          console.warn("Smart Account imzası başarısız, normal imza deneniyor...", smartError);
          currentSig = await signMessageAsync({ message: finalMessage });
        }
      } else {
        // Normal EOA Cüzdanlar
        currentSig = await signMessageAsync({ message: finalMessage });
      }

      setSiwaMessage(finalMessage);
      setSignature(currentSig);
      setShowModal(true);
    } catch (error: any) {
      console.error(error);
      alert("Hata: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignature = async () => {
    try {
      const verifyRes = await fetch('/api/siwa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: siwaMessage,
          signature,
        }),
      });

      const result = await verifyRes.json();

      if (result.success || result.receipt) {
        alert(`✅ Başarılı!\nAgent: ${agentName}\nAgent ID: ${agentId}`);
        setShowModal(false);
      } else {
        alert("❌ Doğrulama başarısız: " + result.error);
      }
    } catch (error: any) {
      alert("Verify hatası: " + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-zinc-950 rounded-3xl border border-zinc-800 space-y-8" style={{background: 'var(--surface)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '1rem', marginTop: '1rem'}}>
      <div className="text-center" style={{textAlign: 'center', marginBottom: '2rem'}}>
        <h1 className="text-3xl font-bold mb-2">SIWA - Sign In With Agent</h1>
        <p className="text-zinc-400" style={{color: 'var(--text-dim)'}}>Kendi Agent Bilgilerinizle Giriş Yapın</p>
      </div>

      <div className="grid grid-cols-1 gap-6" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{display: 'block', marginBottom: '0.5rem'}}>Agent Token ID</label>
          <input
            type="number"
            value={agentId}
            onChange={(e) => setAgentId(Number(e.target.value))}
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:outline-none focus:border-blue-500"
            style={{width: '100%', padding: '1rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)'}}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{display: 'block', marginBottom: '0.5rem'}}>Agent Name</label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
            style={{width: '100%', padding: '1rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)'}}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{display: 'block', marginBottom: '0.5rem'}}>Domain (Web Siteniz)</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
            style={{width: '100%', padding: '1rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)'}}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{display: 'block', marginBottom: '0.5rem'}}>Verify URI</label>
          <input
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
            style={{width: '100%', padding: '1rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text)'}}
          />
        </div>
      </div>

      {agentData && (
        <div className="p-5 bg-zinc-900 rounded-2xl border border-zinc-700" style={{padding: '1.25rem', background: 'rgba(0, 255, 0, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(0, 255, 0, 0.2)', marginTop: '1.5rem'}}>
          <p className="text-green-400 text-sm mb-1" style={{color: 'var(--green)', fontSize: '0.875rem', margin: 0}}>Agent Metadata Yüklendi</p>
          <p className="font-semibold" style={{margin: '0.25rem 0 0 0'}}>{agentData.name}</p>
          <p className="text-sm text-zinc-400 line-clamp-2 mt-1" style={{color: 'var(--text-dim)', fontSize: '0.875rem'}}>{agentData.description}</p>
        </div>
      )}

      <button
        onClick={startSiwaFlow}
        disabled={isLoading || !address || !agentId}
        className="w-full py-5 text-lg font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl disabled:opacity-50 hover:brightness-110 transition"
        style={{width: '100%', padding: '1.25rem', background: 'var(--cyan)', marginTop: '1.5rem', fontWeight: 'bold'}}
      >
        {isLoading ? "SIWA Mesajı Hazırlanıyor..." : "SIWA Mesajı Oluştur ve İmzala"}
      </button>

      {/* SIWA Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem'}}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '1rem', width: '100%', maxWidth: '42rem', display: 'flex', flexDirection: 'column'}}>
            <div className="p-6 border-b border-zinc-700" style={{padding: '1.5rem', borderBottom: '1px solid var(--border)'}}>
              <h2 className="text-2xl font-bold" style={{margin: 0}}>SIWA İmzalama</h2>
              <p className="text-zinc-400 mt-1" style={{color: 'var(--text-dim)', marginTop: '0.5rem', margin: '0.5rem 0 0 0'}}>Aşağıdaki mesajı imzalayın</p>
            </div>

            <div className="flex-1 p-6 overflow-auto" style={{padding: '1.5rem', overflow: 'auto', flex: 1}}>
              <pre className="bg-black p-6 rounded-2xl text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed" style={{background: '#000', padding: '1.5rem', borderRadius: '0.5rem', fontSize: '0.875rem', whiteSpace: 'pre-wrap', color: '#ccc', fontFamily: 'monospace'}}>
                {siwaMessage}
              </pre>
            </div>

            <div className="p-6 border-t border-zinc-700 flex gap-4" style={{padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem'}}>
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
                style={{flex: 1, padding: '1rem'}}
              >
                İptal
              </button>
              <button
                onClick={confirmSignature}
                className="btn-primary"
                style={{flex: 1, padding: '1rem', background: 'var(--green)'}}
              >
                İmzala ve Doğrula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
