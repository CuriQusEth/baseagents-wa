// Shared in-memory nonce store
// In production, replace with Redis or a database

export const nonceStore = new Map<string, { expires: number }>();

export function storeNonce(nonce: string, ttlMs = 5 * 60 * 1000) {
  cleanExpired();
  nonceStore.set(nonce, { expires: Date.now() + ttlMs });
}

export function consumeNonce(nonce: string): boolean {
  cleanExpired();
  const entry = nonceStore.get(nonce);
  if (!entry || entry.expires < Date.now()) return false;
  nonceStore.delete(nonce);
  return true;
}

function cleanExpired() {
  const now = Date.now();
  for (const [key, val] of nonceStore.entries()) {
    if (val.expires < now) nonceStore.delete(key);
  }
}
