'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { monadTestnet } from '@/lib/chains';

export function NetworkGuard() {
  const { isConnected, chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chain?.id === monadTestnet.id) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-yellow-500/30 bg-[#0A1628]/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-center text-sm text-yellow-200 sm:text-left">
          Wrong network — switch to <strong>Monad Testnet</strong> to use SovereignX.
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() => switchChain({ chainId: monadTestnet.id })}
          className="shrink-0 rounded-full bg-brand-primary px-4 py-2 text-sm font-bold text-brand-dark disabled:opacity-50"
        >
          {isPending ? 'Switching…' : 'Switch Network'}
        </button>
      </div>
    </div>
  );
}
