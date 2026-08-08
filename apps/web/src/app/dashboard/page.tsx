'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { DashboardSidebar, type DashboardTab } from '@/components/dashboard/DashboardSidebar';
import { DashboardStatCards } from '@/components/dashboard/DashboardStatCards';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { AuditLogPanel } from '@/components/dashboard/AuditLogPanel';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { AssetBlockGrid } from '@/components/AssetBlockGrid';
import { TransferPanel } from '@/components/TransferPanel';
import { ComplianceStatusWidget } from '@/components/ComplianceStatusWidget';
import { EnrollmentPanel } from '@/components/EnrollmentPanel';
import { OraclePanel } from '@/components/OraclePanel';
import { VerifiedInteractionCursor } from '@/components/VerifiedInteractionCursor';
import { useSOVXBalance } from '@/lib/contracts';
import { fetchCVI, fetchOracle } from '@/lib/api';
import type { CVIRecord } from '@sovereignx/shared';

const TAB_TITLES: Record<DashboardTab, string> = {
  overview: 'Portfolio Overview',
  vault: 'T-Bill Vault',
  transfer: 'Transfer SOVX',
  compliance: 'Compliance Center',
  audit: 'Audit Logs',
  settings: 'Settings',
};

export default function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>('overview');
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: balance } = useSOVXBalance(address);
  const [cvi, setCvi] = useState<CVIRecord | null>(null);
  const [yieldRate, setYieldRate] = useState(5.28);

  useEffect(() => {
    if (!address) {
      setCvi(null);
      return;
    }
    fetchCVI(address).then(setCvi).catch(() => setCvi(null));
  }, [address]);

  useEffect(() => {
    fetchOracle()
      .then((q) => setYieldRate(q.yieldRate))
      .catch(() => null);
  }, []);

  function renderContent() {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-500/20 py-24 text-center">
          <p className="mb-2 text-xl font-bold text-white">Connect Your Wallet</p>
          <p className="mb-6 max-w-md text-sm text-slate-400">
            Connect to Monad testnet to view your SOVX balance, sync CVI, and execute compliant transfers.
          </p>
          <button
            type="button"
            onClick={() => connect({ connector: connectors[0] })}
            className="rounded-full bg-brand-primary px-8 py-3 font-bold text-brand-dark"
          >
            Connect Wallet
          </button>
        </div>
      );
    }

    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardStatCards
              balance={balance}
              cviStatus={cvi?.status ?? 'Not Registered'}
              yieldRate={yieldRate}
            />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PortfolioChart />
              </div>
              <OraclePanel />
            </div>
            <EnrollmentPanel />
          </div>
        );
      case 'vault':
        return (
          <div className="space-y-6">
            <AssetBlockGrid />
            <OraclePanel />
          </div>
        );
      case 'transfer':
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <TransferPanel address={address} />
            <ComplianceStatusWidget address={address} />
          </div>
        );
      case 'compliance':
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <ComplianceStatusWidget address={address} />
            <EnrollmentPanel />
          </div>
        );
      case 'audit':
        return <AuditLogPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen">
      <VerifiedInteractionCursor />
      <DashboardSidebar active={tab} onNavigate={setTab} />
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">SovereignX Vault</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">{TAB_TITLES[tab]}</h1>
          {address && (
            <p className="mt-2 font-mono text-xs text-slate-500">{address}</p>
          )}
        </header>
        {renderContent()}
      </main>
    </div>
  );
}
