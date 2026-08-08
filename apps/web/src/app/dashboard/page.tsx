'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
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
import { DividendPanel } from '@/components/dashboard/DividendPanel';
import { ValidatorStatusPanel } from '@/components/dashboard/ValidatorStatusPanel';
import { VerifiedInteractionCursor } from '@/components/VerifiedInteractionCursor';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useSOVXBalance } from '@/lib/contracts';
import { fetchCVI, fetchOracle } from '@/lib/api';
import type { CVIRecord } from '@sovereignx/shared';

const TAB_TITLES: Record<DashboardTab, string> = {
  overview: 'Portfolio Overview',
  vault: 'T-Bill Vault',
  transfer: 'Transfer SOVX',
  compliance: 'Compliance Center',
  dividends: 'CVA Dividends',
  audit: 'Audit Logs',
  settings: 'Settings',
};

export default function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>('overview');
  const { address, isConnected } = useAccount();
  const { data: balance } = useSOVXBalance(address);
  const [cvi, setCvi] = useState<CVIRecord | null>(null);
  const [yieldRate, setYieldRate] = useState<number | null>(null);

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
            Connect MetaMask on <strong>Monad Testnet</strong> to view SOVX balance,
            sync CVI via Cleanverse A-Pass, and execute compliant transfers.
          </p>
          <ConnectWallet />
          <p className="mt-6 max-w-sm text-xs text-slate-500">
            New to Monad? Add network: Chain ID 10143 · RPC https://testnet-rpc.monad.xyz
          </p>
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
            <DividendPanel wallet={address} />
          </div>
        );
      case 'vault':
        return (
          <div className="space-y-6">
            <AssetBlockGrid balance={balance} />
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
            <ValidatorStatusPanel />
          </div>
        );
      case 'dividends':
        return <DividendPanel wallet={address} />;
      case 'audit':
        return <AuditLogPanel wallet={address} />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <VerifiedInteractionCursor />
      <DashboardSidebar active={tab} onNavigate={setTab} />
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <header className="mb-6 md:mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">SovereignX Vault</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            {TAB_TITLES[tab]}
          </h1>
          {address && (
            <p className="mt-2 hidden font-mono text-xs text-slate-500 md:block">{address}</p>
          )}
        </header>
        {renderContent()}
      </main>
    </div>
  );
}
