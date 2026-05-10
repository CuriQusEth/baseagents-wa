"use client";

import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";
import DynamicSiwaButton from "@/components/DynamicSiwaButton";

export default function SIWAPage() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const isMainnet = chainId === base.id;

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
      <div className="scan-line" />

      {/* Header */}
      <header className="siwa-header">
        <div className="logo-mark">
          <div className="logo-hex">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M24 4L43.05 14V34L24 44L4.95 34V14L24 4Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M24 14L33.05 19V29L24 34L14.95 29V19L24 14Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
              <circle cx="24" cy="24" r="3" fill="currentColor" />
            </svg>
          </div>
          <span className="logo-text">SIWA HUB</span>
        </div>
        <div className="header-right">
          <div className={`network-badge ${isMainnet ? "mainnet" : "testnet"}`}>
            <span className="network-dot" />
            {isMainnet ? "Base Mainnet" : "Base Sepolia"}
          </div>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
        </div>
      </header>

      {/* Content */}
      <div className="siwa-container">
        {/* Hero */}
        <div className="hero anim-up">
          <div className="hero-badge">ERC-8004 · ERC-8128 · Base Network</div>
          <h1 className="hero-title">Sign In<span className="hero-accent"> With Agent</span></h1>
          <p className="hero-sub">Trustless identity authentication for AI agents. Prove on-chain ownership of your ERC-8004 NFT.</p>
        </div>

        {/* Card */}
        <div className="auth-card anim-up" style={{ animationDelay: "0.15s" }}>
          {!isConnected ? (
            <div className="center-state">
              <div className="state-icon anim-float" style={{ color: "var(--cyan)" }}>
                <svg viewBox="0 0 64 64" fill="none"><path d="M32 8L56 20V44L32 56L8 44V20L32 8Z" stroke="currentColor" strokeWidth="1.5" /><circle cx="32" cy="32" r="5" fill="currentColor" /></svg>
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Connect Your Wallet</h2>
              <p className="state-desc">Connect a wallet holding an ERC-8004 Agent NFT</p>
              <ConnectButton label="Connect Wallet" />
            </div>
          ) : (
            <div className="p-8">
               <DynamicSiwaButton />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="info-grid anim-up" style={{ animationDelay: "0.3s" }}>
          {[
            { icon:"🔷", title:"ERC-8004 Identity", desc:"Your Agent NFT is a verifiable on-chain identity — discoverable, ownable, transferable." },
            { icon:"🔐", title:"ERC-8128 Signing", desc:"Every request is cryptographically signed. The server verifies your public key from the registry." },
            { icon:"⚡", title:"Replay Protected", desc:"Single-use nonces prevent replay attacks. Receipts are HMAC-signed and time-limited." },
          ].map(c => (
            <div key={c.title} className="info-card">
              <span style={{ fontSize: "1.2rem" }}>{c.icon}</span>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700 }}>{c.title}</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="siwa-footer">
        <span>Built on</span>
        <a href="https://base.org" target="_blank" rel="noopener noreferrer">Base</a>
        <span>·</span>
        <a href="https://siwa.id" target="_blank" rel="noopener noreferrer">SIWA Protocol</a>
        <span>·</span>
        <a href="https://8004.org" target="_blank" rel="noopener noreferrer">ERC-8004</a>
      </footer>

      <style>{`
        .scan-line { position:fixed; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--cyan),transparent); animation:scan 6s linear infinite; opacity:0.3; z-index:10; pointer-events:none; }
        .siwa-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 2rem; border-bottom:1px solid var(--border); backdrop-filter:blur(12px); position:sticky; top:0; z-index:50; background:rgba(2,4,8,0.85); }
        .logo-mark { display:flex; align-items:center; gap:0.625rem; color:var(--cyan); }
        .logo-hex { width:2rem; height:2rem; animation:pulse-glow 3s ease-in-out infinite; }
        .logo-text { font-weight:800; font-size:1.125rem; letter-spacing:0.15em; }
        .header-right { display:flex; align-items:center; gap:1rem; }
        .network-badge { display:flex; align-items:center; gap:0.375rem; padding:0.25rem 0.75rem; border-radius:999px; font-size:0.75rem; font-family:var(--font-mono); border:1px solid; }
        .network-badge.mainnet { border-color:rgba(0,255,136,0.3); color:var(--green); background:rgba(0,255,136,0.05); }
        .network-badge.testnet { border-color:rgba(0,212,255,0.3); color:var(--cyan); background:rgba(0,212,255,0.05); }
        .network-dot { width:6px; height:6px; border-radius:50%; background:currentColor; animation:pulse-glow 1.5s ease-in-out infinite; }
        .siwa-container { flex:1; max-width:640px; margin:0 auto; width:100%; padding:3rem 1.5rem; display:flex; flex-direction:column; gap:2rem; }
        .hero { text-align:center; }
        .hero-badge { display:inline-block; font-family:var(--font-mono); font-size:0.7rem; letter-spacing:0.15em; color:var(--cyan-dim); border:1px solid var(--border); padding:0.25rem 0.875rem; border-radius:999px; margin-bottom:1.25rem; text-transform:uppercase; }
        .hero-title { font-size:clamp(2.25rem,6vw,3.5rem); font-weight:800; line-height:1.05; letter-spacing:-0.03em; margin-bottom:1rem; }
        .hero-accent { color:var(--cyan); }
        .hero-sub { color:var(--text-dim); font-size:1rem; line-height:1.6; max-width:420px; margin:0 auto; }
        .auth-card { background:var(--surface); border:1px solid var(--border); border-radius:1.25rem; overflow:hidden; transition:border-color 0.3s; }
        .auth-card:hover { border-color:var(--border-hover); }
        .center-state { padding:2.5rem 2rem; display:flex; flex-direction:column; align-items:center; gap:1.125rem; text-align:center; }
        .state-icon { width:4rem; height:4rem; }
        .state-desc { color:var(--text-dim); font-size:0.88rem; max-width:320px; line-height:1.6; }
        .input-state { padding:1.75rem; display:flex; flex-direction:column; gap:1.25rem; }
        .card-hdr { display:flex; align-items:center; gap:0.5rem; font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em; padding-bottom:1rem; border-bottom:1px solid var(--border); }
        .card-hdr-dot { width:6px; height:6px; border-radius:50%; background:var(--cyan); animation:pulse-glow 2s ease-in-out infinite; }
        .fgroup { display:flex; flex-direction:column; gap:0.4rem; }
        .flabel { font-size:0.75rem; font-weight:600; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.08em; display:flex; align-items:center; justify-content:space-between; }
        .flabel-link { color:var(--cyan-dim); font-size:0.7rem; text-decoration:none; font-weight:400; text-transform:none; letter-spacing:0; }
        .flabel-link:hover { color:var(--cyan); }
        .fdisplay { display:flex; align-items:center; gap:0.5rem; padding:0.625rem 0.875rem; background:rgba(0,212,255,0.04); border:1px solid var(--border); border-radius:0.6rem; }
        .addr-dot { width:8px; height:8px; border-radius:50%; background:var(--green); flex-shrink:0; animation:pulse-glow 2s ease-in-out infinite; }
        .finput { padding:0.75rem 0.875rem; background:rgba(0,212,255,0.04); border:1px solid var(--border); border-radius:0.6rem; font-family:var(--font-mono); font-size:1rem; color:var(--text); outline:none; transition:border-color 0.2s, box-shadow 0.2s; width:100%; }
        .finput:focus { border-color:rgba(0,212,255,0.5); box-shadow:0 0 0 3px rgba(0,212,255,0.08); }
        .finput::placeholder { color:var(--text-dim); }
        .finput:disabled { opacity:0.5; cursor:not-allowed; }
        .flow-steps { display:flex; border:1px solid var(--border); border-radius:0.6rem; overflow:hidden; }
        .fstep { flex:1; display:flex; align-items:center; gap:0.4rem; padding:0.5rem 0.625rem; font-size:0.72rem; color:var(--text-dim); border-right:1px solid var(--border); transition:all 0.3s; }
        .fstep:last-child { border-right:none; }
        .fstep.active { color:var(--cyan); background:rgba(0,212,255,0.06); }
        .fstep.done { color:var(--green); background:rgba(0,255,136,0.04); }
        .fstep-num { width:18px; height:18px; border-radius:50%; border:1px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-family:var(--font-mono); flex-shrink:0; }
        .fstep-num svg { width:10px; height:10px; }
        .fspinner { width:8px; height:8px; border-radius:50%; border:1.5px solid transparent; border-top-color:currentColor; animation:spin-slow 0.8s linear infinite; display:block; }
        .status-msg { display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; color:var(--cyan-dim); font-family:var(--font-mono); }
        .sdot { width:6px; height:6px; border-radius:50%; background:var(--cyan); flex-shrink:0; }
        .btn-primary { width:100%; padding:0.875rem 1.5rem; background:linear-gradient(135deg,var(--cyan),var(--cyan-dim)); color:#000; font-weight:700; font-size:0.95rem; letter-spacing:0.05em; border:none; border-radius:0.6rem; cursor:pointer; transition:opacity 0.2s, transform 0.1s; }
        .btn-primary:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
        .btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
        .btn-secondary { width:100%; padding:0.75rem 1.5rem; background:transparent; color:var(--text-dim); font-weight:600; font-size:0.9rem; border:1px solid var(--border); border-radius:0.6rem; cursor:pointer; transition:all 0.2s; }
        .btn-secondary:hover { border-color:var(--border-hover); color:var(--text); }
        .result-grid { width:100%; display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
        .result-item { background:rgba(0,255,136,0.04); border:1px solid rgba(0,255,136,0.12); border-radius:0.6rem; padding:0.625rem 0.875rem; display:flex; flex-direction:column; gap:0.25rem; }
        .result-item.full { grid-column:1/-1; }
        .rl { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-dim); font-family:var(--font-mono); }
        .rv { font-size:0.9rem; font-weight:600; color:var(--green); }
        .receipt-block { width:100%; border:1px solid var(--border); border-radius:0.6rem; overflow:hidden; }
        .receipt-hdr { display:flex; align-items:center; justify-content:space-between; padding:0.5rem 0.875rem; border-bottom:1px solid var(--border); font-family:var(--font-mono); font-size:0.72rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.08em; background:rgba(0,212,255,0.03); }
        .copy-btn { background:transparent; border:1px solid var(--border); color:var(--cyan-dim); font-family:var(--font-mono); font-size:0.65rem; padding:0.125rem 0.5rem; border-radius:4px; cursor:pointer; transition:all 0.2s; }
        .copy-btn:hover { border-color:var(--cyan); color:var(--cyan); }
        .receipt-val { padding:0.75rem 0.875rem; font-family:var(--font-mono); font-size:0.65rem; color:var(--text-dim); word-break:break-all; line-height:1.5; }
        .info-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; }
        .info-card { background:var(--surface); border:1px solid var(--border); border-radius:0.875rem; padding:1.125rem; display:flex; flex-direction:column; gap:0.4rem; transition:border-color 0.2s; }
        .info-card:hover { border-color:var(--border-hover); }
        .siwa-footer { display:flex; align-items:center; justify-content:center; gap:0.625rem; padding:1.5rem; border-top:1px solid var(--border); font-size:0.75rem; color:var(--text-dim); }
        .siwa-footer a { color:var(--cyan-dim); text-decoration:none; transition:color 0.2s; }
        .siwa-footer a:hover { color:var(--cyan); }
        .anim-up { animation:fadeInUp 0.6s ease forwards; opacity:0; }
        .anim-float { animation:float 3s ease-in-out infinite; }
        .anim-pulse { animation:pulse-glow 2s ease-in-out infinite; }
        @media (max-width:540px) {
          .info-grid { grid-template-columns:1fr; }
          .result-grid { grid-template-columns:1fr; }
          .fstep span { display:none; }
          .siwa-header { padding:1rem; gap:0.5rem; }
          .logo-text { font-size:0.9rem; }
        }
      `}</style>
    </main>
  );
}
