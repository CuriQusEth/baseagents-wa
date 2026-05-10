### **SIWA Hub - Kullanıcının Kendi Agent Bilgileriyle İmza Alma Sistemi**

Bu sistem, kullanıcının girdiği **Agent ID**’ye ait gerçek metadata’yı (ad, açıklama, registry vs.) otomatik çekerek **kişiselleştirilmiş SIWA mesajı** oluşturur.

#### 1. Agent Metadata Nasıl Çekilir?

**Önerilen Yöntem (En Kolay ve Güvenilir):**

```ts
// lib/agent-metadata.ts
export async function getAgentMetadata(agentId: number, chainId: number = 8453) {
  const registryAddress = chainId === 8453 
    ? "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"   // Base Mainnet
    : "0x8004A818BFB912233c491871b3d84c89A494BD9e"; // Sepolia

  // 1. On-chain tokenURI al (wagmi / viem ile)
  const tokenURI = await publicClient.readContract({
    address: registryAddress as `0x${string}`,
    abi: [
      { name: "tokenURI", type: "function", stateMutability: "view", inputs: [{type: "uint256"}], outputs: [{type: "string"}] }
    ],
    functionName: "tokenURI",
    args: [BigInt(agentId)],
  });

  let metadata: any = {};

  // 2. URI'yi fetch et (ipfs, https, data:base64)
  if (tokenURI.startsWith("ipfs://")) {
    const ipfsUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    metadata = await fetch(ipfsUrl).then(r => r.json());
  } 
  else if (tokenURI.startsWith("http")) {
    metadata = await fetch(tokenURI).then(r => r.json());
  } 
  else if (tokenURI.startsWith("data:application/json;base64,")) {
    const json = atob(tokenURI.split(',')[1]);
    metadata = JSON.parse(json);
  }

  return {
    name: metadata.name || `Agent #${agentId}`,
    description: metadata.description || "",
    image: metadata.image || "",
    endpoints: metadata.endpoints || [],
    owner: await getOwner(agentId), // ownerOf çağrısı
    registryCaip: `eip155:${chainId}:${registryAddress}`,
  };
}
```

**Alternatif Hızlı Yöntem (8004scan API):**

```ts
const res = await fetch(`https://8004scan.io/api/v1/public/agents/${chainId}/${agentId}`);
const data = await res.json();
```

---

#### 2. SIWA Mesajını Dinamik Oluşturma (En Önemli Kısım)

```ts
function buildSiwaMessage({
  domain,
  address,
  agentId,
  agentName,
  registryCaip,
  chainId,
  nonce,
  issuedAt,
}: {
  domain: string;
  address: string;
  agentId: number;
  agentName: string;
  registryCaip: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
}) {
  return `${domain} wants you to sign in with your Agent account:
${address}

Sign in with my on-chain Agent (${agentName}) to SIWA Hub

URI: https://${domain}/api/siwa/verify
Version: 1
Agent ID: ${agentId}
Agent Name: ${agentName}
Agent Registry: ${registryCaip}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}
```

**Örnek Çıktı (Kullanıcının Verdiği Agent):**

```
baseagentt.vercel.app wants you to sign in with your Agent account:
0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B

Sign in with my on-chain Agent (Woodblock AI Agent) to SIWA Hub

URI: https://baseagentt.vercel.app/api/siwa/verify
Version: 1
Agent ID: 46324
Agent Name: Woodblock AI Agent
Agent Registry: eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
Chain ID: 8453
Nonce: abc123...
Issued At: 2026-05-10T...
```

---

#### 3. Frontend'de Kullanım (SiwaSignButton Güncellemesi)

```tsx
const [agentData, setAgentData] = useState<any>(null);

useEffect(() => {
  if (agentId) {
    getAgentMetadata(Number(agentId)).then(setAgentData);
  }
}, [agentId]);

// Buton içinde:
const siwaMessage = buildSiwaMessage({
  domain: window.location.host,
  address: address!,
  agentId: Number(agentId),
  agentName: agentData?.name || `Agent #${agentId}`,
  registryCaip: agentData?.registryCaip || "...",
  chainId: 8453,
  nonce,
  issuedAt,
});
```

---

#### 4. En İyi Pratikler

1. **Cache** ekle (5-10 dakika) — her seferinde aynı Agent ID için tekrar çekmesin.
2. **Hata durumu** göster: “Bu Agent ID bulunamadı” veya “Metadata yüklenemedi”.
3. **Agent Name**’i SIWA mesajına ve butona yaz (kullanıcı “Woodblock AI Agent ile giriş yap” görsün).
4. **Image** varsa Agent kartında göster.
5. Hem **Mainnet** hem **Sepolia** destekle (chain switch).
