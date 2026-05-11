import { ConnectButton } from '@rainbow-me/rainbowkit';
import DynamicSiwaButton from '@/components/DynamicSiwaButton';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-zinc-950 text-white flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-center">SIWA Agent Demo</h1>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
        <DynamicSiwaButton />
      </div>
    </main>
  );
}
