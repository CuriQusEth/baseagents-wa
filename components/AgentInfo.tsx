"use client";

import { useAccount, useReadContract, useChainId } from "wagmi";
import { base } from "wagmi/chains";

const REGISTRY_ABI = [
  {
    name: "getAgentsByOwner",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getAgent",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [
      { name: "agentOwner",   type: "address" },
      { name: "agentSigner",  type: "address" },
      { name: "metadata",     type: "string"  },
      { name: "registeredAt", type: "uint256" },
    ],
  },
] as const;

const REGISTRY_MAINNET = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const REGISTRY_TESTNET = "0x8004A818BFB912233c491871b3d84c89A494BD9e";

interface AgentInfoProps {
  agentId: number;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "3px 0" }}>
      <span style={{ color: "var(--text-dim)" }}>{label}</span>
      <span style={{ fontFamily: "monospace", color: "var(--text)" }}>{value}</span>
    </div>
  );
}

export function AgentInfo({ agentId }: AgentInfoProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const registry = (chainId === base.id ? REGISTRY_MAINNET : REGISTRY_TESTNET) as `0x${string}`;

  const { data: ownedAgents } = useReadContract({
    address: registry,
    abi: REGISTRY_ABI,
    functionName: "getAgentsByOwner",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: agentData, isLoading } = useReadContract({
    address: registry,
    abi: REGISTRY_ABI,
    functionName: "getAgent",
    args: agentId > 0 ? [BigInt(agentId)] : undefined,
    query: { enabled: agentId > 0 },
  });

  if (!address) return null;

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: "0.5rem",
      padding: "14px 16px",
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>

      {/* Cüzdandaki tüm agentlar */}
      {ownedAgents && ownedAgents.length > 0 && (
        <div>
          <p style={{
            fontSize: "10px", color: "var(--text-dim)",
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "8px", fontFamily: "monospace",
          }}>
            Cüzdanındaki Agent NFT&apos;leri
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {ownedAgents.map((id) => (
              <span key={id.toString()} style={{
                padding: "3px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(0,82,255,0.35)",
                color: "var(--cyan)",
                fontFamily: "monospace",
                fontSize: "12px",
                background: "rgba(0,82,255,0.06)",
              }}>
                #{id.toString()}
              </span>
            ))}
          </div>
        </div>
      )}

      {ownedAgents && ownedAgents.length === 0 && (
        <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>
          Bu cüzdanda kayıtlı Agent NFT bulunamadı.{" "}
          <a
            href="https://www.8004scan.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--cyan)" }}
          >
            8004scan.io&apos;dan kayıt ol →
          </a>
        </p>
      )}

      {/* Seçili agent detayı */}
      {isLoading && agentId > 0 && (
        <p style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "monospace" }}>
          Agent #{agentId} yükleniyor...
        </p>
      )}

      {agentData && agentId > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
          <p style={{
            fontSize: "10px", color: "var(--text-dim)",
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "10px", fontFamily: "monospace",
          }}>
            Agent #{agentId} — Onchain Bilgiler
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Row
              label="Sahip"
              value={`${agentData[0].slice(0, 6)}...${agentData[0].slice(-4)}`}
            />
            <Row
              label="Signer"
              value={`${agentData[1].slice(0, 6)}...${agentData[1].slice(-4)}`}
            />
            <Row
              label="Kayıt tarihi"
              value={new Date(Number(agentData[3]) * 1000).toLocaleDateString("tr-TR")}
            />
            {agentData[2] && (
              <Row
                label="Metadata"
                value={agentData[2].length > 35 ? agentData[2].slice(0, 35) + "..." : agentData[2]}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
