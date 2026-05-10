'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { getAgentMetadata, type AgentMetadata } from '@/lib/agent-metadata';

export default function SiwaSignButton({ agentId: initialAgentId, onSuccess }: { agentId: number, onSuccess?: (result: any) => void }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [agentId] = useState(initialAgentId);
  const [agentData, setAgentData] = useState<AgentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [siwaMessage, setSiwaMessage] = useState('');
  const [nonceData, setNonceData] = useState<any>(null);

  useEffect(() => {
    if (agentId) {
      getAgentMetadata(agentId, 8453).then(setAgentData);
    }
  }, [agentId]);

  const handleSignIn = async () => {
    if (!address || !agentData) return;

    setIsLoading(true);

    try {
      const nonceRes = await fetch('/api/siwa/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, agentId }),
      });

      const nonceInfo = await nonceRes.json();
      setNonceData(nonceInfo);

      const domain = window.location.host;
      const message = `${domain} wants you to sign in with your Agent account:
${address}

Sign in with my on-chain Agent (${agentData.name}) to SIWA Hub

URI: ${window.location.origin}/api/siwa/verify
Version: 1
Agent ID: ${agentId}
Agent Name: ${agentData.name}
Agent Registry: ${agentData.registryCaip}
Chain ID: ${agentData.chainId}
Nonce: ${nonceInfo.nonce}
Issued At: ${nonceInfo.issuedAt}`;

      setSiwaMessage(message);
      setShowModal(true);
    } catch (error: any) {
      alert('Nonce alınamadı: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAndSign = async () => {
    if (!siwaMessage) return;

    try {
      const signature = await signMessageAsync({ message: siwaMessage });

      const verifyRes = await fetch('/api/siwa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          agentId,
          nonce: nonceData.nonce,
          signature,
          message: siwaMessage,
        }),
      });

      if (verifyRes.ok) {
        const receipt = await verifyRes.json();
        if (onSuccess) {
          onSuccess(receipt);
        } else {
          alert('✅ Başarıyla imzalandı! Receipt alındı: ' + JSON.stringify(receipt));
        }
        setShowModal(false);
      } else {
        alert('❌ Verify başarısız');
      }
    } catch (error: any) {
      alert('İmza hatası: ' + error.message);
    }
  };

  if (!agentData) {
    return <div style={{ textAlign: "center", padding: "16px", color: "var(--text-dim)" }}>Agent bilgileri yükleniyor...</div>;
  }

  return (
    <>
      <button
        onClick={handleSignIn}
        disabled={isLoading || !address}
        className="btn-primary"
      >
        {isLoading ? 'Yükleniyor...' : `${agentData.name} ile Sign In`}
      </button>

      {/* Agent Kartı */}
      <div style={{ marginTop: "16px", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {agentData.image && (
            <img src={agentData.image} alt={agentData.name} style={{ width: "48px", height: "48px", borderRadius: "8px" }} />
          )}
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{agentData.name}</h3>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-dim)" }}>{agentData.description?.slice(0, 50)}...</p>
          </div>
        </div>
      </div>

      {/* SIWA Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px"
        }}>
          <div style={{
            background: "var(--background)", border: "1px solid var(--border)",
            borderRadius: "16px", maxWidth: "600px", width: "100%", maxHeight: "90vh",
            display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ margin: 0, fontSize: "20px" }}>Sign In With Agent</h2>
              <p style={{ margin: "4px 0 0 0", color: "var(--text-dim)", fontSize: "14px" }}>Aşağıdaki mesajı imzalayacaksınız</p>
            </div>

            <div style={{ padding: "24px", overflow: "auto" }}>
              <pre style={{
                background: "#000", padding: "16px", borderRadius: "12px",
                fontSize: "12px", color: "#ccc", whiteSpace: "pre-wrap"
              }}>
                {siwaMessage}
              </pre>
            </div>

            <div style={{ padding: "24px", borderTop: "1px solid var(--border)", display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: "12px" }}
              >
                İptal
              </button>
              <button
                onClick={confirmAndSign}
                className="btn-primary"
                style={{ flex: 1, padding: "12px", background: "var(--green)" }}
              >
                İmzala ve Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
