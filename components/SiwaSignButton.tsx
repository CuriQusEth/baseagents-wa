'use client';

import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useSiwa } from '@/hooks/useSiwa';

export default function SiwaSignButton({ agentId, onSuccess }: { agentId: number, onSuccess?: (result: any) => void }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);

  const { getNonce, verifySiwa } = useSiwa();

  const handleSignIn = async () => {
    if (!address || !agentId) return;

    setIsLoading(true);

    try {
      // 1. Nonce al
      const { nonce, issuedAt } = await getNonce(address, agentId);

      // 2. Doğru SIWA mesajını oluştur
      const siwaMessage = `${window.location.host} wants you to sign in with your Agent account:\n${address}\n\nSign in with my on-chain Agent to SIWA Hub\n\nURI: ${window.location.origin}/api/siwa/verify\nVersion: 1\nAgent ID: ${agentId}\nAgent Registry: eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

      // 3. Kullanıcıya mesajı göstererek imzalat
      const signature = await signMessageAsync({
        message: siwaMessage,
      });

      // 4. Sunucuya gönder ve verify et
      const receipt = await verifySiwa({
        address,
        agentId,
        nonce,
        signature,
        message: siwaMessage,
      });

      if (onSuccess) {
        onSuccess(receipt);
      } else {
        alert('✅ Başarıyla giriş yapıldı! Receipt: ' + JSON.stringify(receipt));
      }

    } catch (error: any) {
      console.error(error);
      alert('❌ İmza hatası: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading || !address}
      className="btn-primary" // Using standard UI btn class to fit styling
      style={{ marginTop: '0.5rem' }}
    >
      {isLoading ? 'İmzalanıyor...' : 'Sign In With Agent'}
    </button>
  );
}
