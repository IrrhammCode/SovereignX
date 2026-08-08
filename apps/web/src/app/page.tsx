'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { VaultHeader } from '@/components/VaultHeader';
import { ComplianceStatusWidget } from '@/components/ComplianceStatusWidget';
import { AssetBlockGrid } from '@/components/AssetBlockGrid';
import { TransferPanel } from '@/components/TransferPanel';
import { OraclePanel } from '@/components/OraclePanel';
import { EnrollmentPanel } from '@/components/EnrollmentPanel';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-8">
      <VaultHeader
        isConnected={isConnected}
        address={address}
        onConnect={() => connect({ connector: connectors[0] })}
        onDisconnect={() => disconnect()}
      />

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AssetBlockGrid />
          <TransferPanel address={address} />
        </div>
        <div className="space-y-6">
          <EnrollmentPanel />
          <ComplianceStatusWidget address={address} />
          <OraclePanel />
        </div>
      </section>

      <footer className="mt-16 border-t border-sovereign-green/10 pt-6 text-center text-xs text-gray-500">
        SovereignX (SOVX) · ERC-3643 · Cleanverse CVI/CVA · Monad · Toxic liquidity is mathematically impossible.
      </footer>
    </main>
  );
}
