'use client';

import { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from 'wagmi';
import { Wallet, X, Loader2 } from 'lucide-react';
import { monadTestnet } from '@/lib/chains';
import { cn } from '@/lib/utils';

interface ConnectWalletProps {
  showBalance?: boolean;
  className?: string;
}

export function ConnectWallet({ className }: ConnectWalletProps) {
  const [open, setOpen] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();

  const wrongNetwork = isConnected && chain?.id !== monadTestnet.id;

  if (isConnected && address) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {wrongNetwork && (
          <button
            type="button"
            disabled={switching}
            onClick={() => switchChain({ chainId: monadTestnet.id })}
            className="rounded-full bg-yellow-500/20 px-3 py-1.5 text-xs font-semibold text-yellow-300 ring-1 ring-yellow-500/40"
          >
            {switching ? 'Switching…' : 'Switch to Monad'}
          </button>
        )}
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-mono text-emerald-300 hover:bg-emerald-500/20"
        >
          {address.slice(0, 6)}…{address.slice(-4)}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-bold text-brand-dark shadow-glow hover:brightness-110',
          className,
        )}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/15 bg-[#0A1628] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-400">
              Connect to <strong className="text-white">Monad Testnet</strong> (Chain ID 10143)
            </p>

            <div className="space-y-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  const injectedConnector = connectors.find((c) => c.id === 'injected') ?? connectors[0];
                  if (!injectedConnector) return;
                  connect(
                    { connector: injectedConnector, chainId: monadTestnet.id },
                    { onSuccess: () => setOpen(false) },
                  );
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/15 bg-black/30 px-4 py-3 text-left text-sm font-medium text-white transition hover:border-brand-primary/40 hover:bg-brand-primary/10 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                ) : (
                  <Wallet className="h-5 w-5 text-brand-primary" />
                )}
                MetaMask / Injected Wallet
              </button>
            </div>

            {error && (
              <p className="mt-4 text-xs text-red-400">
                {error.message.includes('User rejected')
                  ? 'Connection cancelled.'
                  : error.message}
              </p>
            )}

            <p className="mt-4 text-[10px] leading-relaxed text-slate-600">
              Add Monad Testnet in MetaMask: RPC https://testnet-rpc.monad.xyz · Symbol MON
            </p>
          </div>
        </div>
      )}
    </>
  );
}
