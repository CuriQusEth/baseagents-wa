'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { signSIWAMessage } from "@buildersgarden/siwa";
import { getAgentMetadata, type AgentMetadata } from '@/lib/agent-metadata';
import { createWalletClient, custom } from 'viem';
import { getAgentTools, getToolConfig, checkToolAccess, fetchToolMetadata, type ToolConfig } from '@/lib/erc8257';

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
  const [signature, setSignature] = useState("");

  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);

  // Agent Metadata Çek
  useEffect(() => {
    if (agentId > 0) {
      getAgentMetadata(agentId, 8453).then(setAgentData);
    }
  }, [agentId]);

  const loadAgentTools = async () => {
    if (!address || agentId <= 0) return;
    setIsLoadingTools(true);
    try {
      const toolIds = await getAgentTools(agentId);
      const loadedTools: ToolConfig[] = [];
      for (const tId of toolIds) {
        const config = await getToolConfig(tId);
        if (config) {
          const isAccessible = await checkToolAccess(tId, address);
          config.accessible = isAccessible;
          config.metadata = await fetchToolMetadata(config.metadataURI);
          loadedTools.push(config);
        }
      }
      setTools(loadedTools);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTools(false);
    }
  };

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
          generatedMessage = (res as any).message || res; // depending on the SDK export structure
      } catch (err) {
          generatedMessage = `${domain} wants you to sign in with your Agent account:\n${address}\n\nSign in with my on-chain Agent to SIWA Hub\n\nURI: ${uri}\nVersion: 1\nAgent ID: ${agentId}\nAgent Registry: eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${issuedAt}`;
      }

      const rawMsg = typeof generatedMessage === "string" ? generatedMessage : String(generatedMessage);

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

  const invokeTool = (tool: ToolConfig) => {
    alert(`Tool ${tool.toolId} çağrılıyor...\n\nBu kısımda SIWA Receipt + ERC-8128 + x402 entegrasyonu yapılacak.`);
    // Gelecek adım: signAuthenticatedRequest ile tool endpoint'ine istek atma
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="p-8 bg-zinc-950 rounded-3xl border border-zinc-800 space-y-8" style={{background: 'var(--surface)', border: '1px solid var(--border)'}}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">SIWA - Sign In With Agent</h1>
          <p className="text-zinc-400" style={{color: 'var(--text-dim)'}}>Kendi Agent Bilgilerinizle Giriş Yapın</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Agent Token ID</label>
            <input
              type="number"
              value={agentId}
              onChange={(e) => setAgentId(Number(e.target.value))}
              className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:outline-none focus:border-blue-500"
              style={{background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)'}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
              style={{background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)'}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Domain (Web Siteniz)</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
              style={{background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)'}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Verify URI</label>
            <input
              type="text"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl"
              style={{background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)'}}
            />
          </div>
        </div>

        {agentData && (
          <div className="p-5 bg-zinc-900 rounded-2xl border border-zinc-700" style={{background: 'rgba(0, 255, 0, 0.05)', border: '1px solid rgba(0, 255, 0, 0.2)'}}>
            <p className="text-green-400 text-sm mb-1" style={{color: 'var(--green)'}}>Agent Metadata Yüklendi</p>
            <p className="font-semibold">{agentData.name}</p>
            <p className="text-sm text-zinc-400 line-clamp-2 mt-1" style={{color: 'var(--text-dim)'}}>{agentData.description}</p>
          </div>
        )}

        <button
          onClick={startSiwaFlow}
          disabled={isLoading || !address || !agentId}
          className="w-full py-5 text-lg font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl disabled:opacity-50 hover:brightness-110 transition"
          style={{background: 'var(--cyan)'}}
        >
          {isLoading ? "SIWA Mesajı Hazırlanıyor..." : "SIWA Mesajı Oluştur ve İmzala"}
        </button>
      </div>

      {/* ==================== ERC-8257 TOOL VIEWER ==================== */}
      <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-700" style={{background: 'var(--surface)', border: '1px solid var(--border)'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            🛠️ ERC-8257 Agent Tools
          </h3>
          <button 
            onClick={loadAgentTools}
            disabled={isLoadingTools}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm transition"
            style={{background: 'var(--border)'}}
          >
            {isLoadingTools ? "Yükleniyor..." : "🔄 Yenile"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tools.length > 0 ? (
            tools.map((tool) => (
              <div 
                key={tool.toolId.toString()} 
                className="group bg-black border border-zinc-800 hover:border-violet-500/50 rounded-2xl p-6 transition-all duration-300"
                style={{background: '#09090b', border: '1px solid var(--border)'}}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-mono text-xs text-violet-400 tracking-widest" style={{color: 'var(--cyan)'}}>TOOL ID</div>
                    <div className="text-2xl font-bold text-white mt-1">#{tool.toolId.toString()}</div>
                  </div>
                  
                  <div className={`px-4 py-1.5 text-xs font-semibold rounded-full ${
                    tool.accessible 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`} style={{color: tool.accessible ? 'var(--green)' : 'var(--red)'}}>
                    {tool.accessible ? '✅ Erişilebilir' : '🔒 Erişim Yok'}
                  </div>
                </div>

                <div className="text-sm text-zinc-400 line-clamp-3 min-h-[60px]" style={{color: 'var(--text-dim)'}}>
                  {tool.metadata?.description || tool.metadata?.name || "Bu tool için açıklama bulunmuyor."}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={async () => {
                      const meta = await fetchToolMetadata(tool.metadataURI);
                      if (meta) {
                        console.log(meta);
                        alert(JSON.stringify(meta, null, 2));
                      }
                    }}
                    className="flex-1 py-3.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition"
                    style={{background: 'var(--border)'}}
                  >
                    📄 Metadata
                  </button>

                  {tool.accessible && (
                    <button
                      onClick={() => invokeTool(tool)}
                      className="flex-1 py-3.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 rounded-2xl transition"
                      style={{background: 'var(--cyan)', color: '#fff'}}
                    >
                      🚀 Tool'u Çağır (Invoke)
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-zinc-500" style={{color: 'var(--text-dim)'}}>
              Bu agenta ait ERC-8257 tool kaydı bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* SIWA Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50}}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{background: 'var(--background)', border: '1px solid var(--border)'}}>
            <div className="p-6 border-b border-zinc-700" style={{borderBottom: '1px solid var(--border)'}}>
              <h2 className="text-2xl font-bold">SIWA İmzalama</h2>
              <p className="text-zinc-400 mt-1" style={{color: 'var(--text-dim)'}}>Aşağıdaki mesajı imzalayın</p>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <pre className="bg-black p-6 rounded-2xl text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed" style={{background: '#000', color: '#ccc', fontFamily: 'monospace'}}>
                {siwaMessage}
              </pre>
            </div>

            <div className="p-6 border-t border-zinc-700 flex gap-4" style={{borderTop: '1px solid var(--border)'}}>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-medium transition"
                style={{background: 'var(--border)'}}
              >
                İptal
              </button>
              <button
                onClick={confirmSignature}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold transition"
                style={{background: 'var(--green)'}}
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
