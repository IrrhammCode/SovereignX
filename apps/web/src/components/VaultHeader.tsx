'use client';

import { SovereignVaultLogo } from './SovereignVaultLogo';

interface VaultHeaderProps {
  isConnected: boolean;
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function VaultHeader({ isConnected, address, onConnect, onDisconnect }: VaultHeaderProps) {
  return (
    <header className="vault-panel flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <SovereignVaultLogo size={56} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Sovereign<span className="text-sovereign-green glow-text">X</span>
          </h1>
          <p className="text-sm text-gray-400">
            Fractional US T-Bills · ERC-3643 · Monad · Cleanverse
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-sovereign-green/30 bg-sovereign-blue/40 px-3 py-1 text-xs text-sovereign-glow md:inline">
          SOVX · $10 min fraction
        </span>
        {isConnected && address ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="rounded-xl border border-sovereign-green/40 bg-sovereign-blue px-4 py-2 text-sm hover:border-sovereign-green"
          >
            {address.slice(0, 6)}…{address.slice(-4)}
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            className="rounded-xl bg-sovereign-green px-5 py-2 text-sm font-medium text-sovereign-navy hover:brightness-110"
          >
            Connect Vault Wallet
          </button>
        )}
      </div>
    </header>
  );
}
