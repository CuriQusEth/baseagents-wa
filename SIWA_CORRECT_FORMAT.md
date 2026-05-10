# SIWA Hub - Doğru SIWA Mesaj Formatı ve Talimatlar

## 1. Resmi SIWA Mesaj Formatı (Doğru Versiyon)

```
{{domain}} wants you to sign in with your Agent account:
{{signer_address}}

Sign in with my on-chain Agent to {{app_name}}

URI: {{uri}}
Version: 1
Agent ID: {{agent_token_id}}
Agent Registry: {{agent_registry_caip}}
Chain ID: {{chain_id}}
Nonce: {{nonce}}
Issued At: {{issued_at}}
Expiration Time: {{expiration_time}} (opsiyonel)
```

### Örnek Doğru Mesaj (Senin Uygulaman İçin)

```
baseagentt.vercel.app wants you to sign in with your Agent account:
0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B

Sign in with my on-chain Agent to SIWA Hub

URI: https://baseagentt.vercel.app/api/siwa/verify
Version: 1
Agent ID: 46324
Agent Registry: eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
Chain ID: 8453
Nonce: YsoUNo3r4-8Y0mCO
Issued At: 2026-05-10T17:14:55.349Z
```

---

## 2. Alanların Açıklamaları ve Dikkat Edilecekler

| Alan                  | Ne Olmalı?                                      | Hata Kaynağı                          |
|-----------------------|------------------------------------------------|---------------------------------------|
| **domain**            | `baseagentt.vercel.app` (sadece host)         | Tam URL yazma                        |
| **signer_address**    | Agent'ın signer cüzdan adresi                 | Yanlış adres → imza doğrulanmaz      |
| **statement**         | Kısa ve net (örnek yukarıda)                   | Çok uzun olursa sorun çıkabilir      |
| **URI**               | `/api/siwa/verify` ile bitmeli                 | Yanlış URI → DOMAIN_MISMATCH         |
| **Agent ID**          | Kullanıcının girdiği ERC-8004 Token ID         | -                                    |
| **Agent Registry**    | `eip155:8453:0x...` (Mainnet) veya Sepolia    | **En sık hata burası**               |
| **Chain ID**          | 8453 (Base Mainnet) veya 84532 (Sepolia)      | Uyumsuzluk yapma                     |

### Registry Adresleri (Güncel)

- **Base Mainnet (8453)**: `eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- **Base Sepolia (84532)**: `eip155:84532:0x8004A818BFB912233c491871b3d84c89A494BD9e` (test için önerilir)

---

## 3. Backend'in (/api/siwa/nonce) Döndürmesi Gerekenler

```json
{
  "nonce": "random-uuid-veya-string",
  "issuedAt": "2026-05-10T17:14:55.349Z",
  "expirationTime": "2026-05-10T17:29:55.349Z"
}
```

---

## 4. Projenizde Nasıl Düzelteceksin?

1. `lib/siwa.ts` veya ilgili dosyada `buildSIWAMessage` fonksiyonunu bul.
2. Aşağıdaki gibi güncelle:

```ts
const message = `${domain} wants you to sign in with your Agent account:
${address}

Sign in with my on-chain Agent to SIWA Hub

URI: ${uri}
Version: 1
Agent ID: ${agentId}
Agent Registry: ${registryCaip}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
```

3. **Domain kontrolü** yaparken sadece `window.location.host` veya Vercel domain'ini kullan.

---

## 5. Test Etme Komutları

```bash
# Nonce al
curl -X POST https://baseagentt.vercel.app/api/siwa/nonce \
  -H "Content-Type: application/json" \
  -d '{"address":"0xKULLANICI_ADRESI","agentId":46324}'

# Sonra imzayı verify et (frontend'den yapılacak)
```
