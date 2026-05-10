'use client';

export function useSiwa() {
  const getNonce = async (address: string, agentId: number) => {
    const res = await fetch('/api/siwa/nonce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, agentId }),
    });

    if (!res.ok) throw new Error('Nonce alınamadı');
    return res.json();
  };

  const verifySiwa = async (data: {
    address: string;
    agentId: number;
    nonce: string;
    signature: string;
    message: string;
  }) => {
    const res = await fetch('/api/siwa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Verify failed');
    return res.json();
  };

  return { getNonce, verifySiwa };
}
