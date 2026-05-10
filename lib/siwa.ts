// lib/siwa.ts
import { signAuthenticatedRequest } from "@buildersgarden/siwa/erc8128";

let currentReceipt: string | null = null;
let currentSigner: any = null;

export function saveSiwaSession(receipt: string, signer: any) {
  currentReceipt = receipt;
  currentSigner = signer;
  if (typeof window !== "undefined") {
    localStorage.setItem("siwa_receipt", receipt);
  }
}

export function getReceipt() {
  if (!currentReceipt && typeof window !== "undefined") {
    currentReceipt = localStorage.getItem("siwa_receipt");
  }
  return currentReceipt;
}

// ====================== ANA FONKSİYON ======================
export async function sendAgentRequest(
  url: string,
  body: any = {},
  method: string = "POST"
) {
  const receipt = getReceipt();

  if (!receipt) {
    throw new Error("SIWA ile giriş yapmalısın (Receipt bulunamadı)");
  }

  if (!currentSigner) {
    throw new Error("Signer bulunamadı. Tekrar SIWA girişi yap.");
  }

  const request = new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: method !== "GET" ? JSON.stringify(body) : undefined,
  });

  const signedRequest = await signAuthenticatedRequest(
    request,
    receipt,
    currentSigner,
    8453 // Base Chain ID
  );

  const response = await fetch(signedRequest);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}
