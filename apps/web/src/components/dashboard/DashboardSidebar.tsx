'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Vault,
  ArrowLeftRight,
  ShieldCheck,
  FileText,
  Settings,
  Home,
  Coins,
} from 'lucide-react';
import { SovereignVaultLogo } from '@/components/SovereignVaultLogo';
import { AuthControls } from '@/components/AuthControls';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';

export type DashboardTab = 'overview' | 'vault' | 'transfer' | 'compliance' | 'dividends' | 'audit' | 'settings';

interface DashboardSidebarProps {
  active: DashboardTab;
  onNavigate: (tab: DashboardTab) => void;
}

const navItems: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'vault', label: 'Vault', icon: Vault },
  { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'dividends', label: 'Dividends', icon: Coins },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar({ active, onNavigate }: DashboardSidebarProps) {
  const { address, isConnected } = useAccount();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-emerald-500/10 bg-[#0A1628]/80 backdrop-blur-xl md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 border-b border-emerald-500/10 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <SovereignVaultLogo size={36} />
          <div>
            <p className="font-bold text-white">
              Sovereign<span className="text-brand-primary">X</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Vault Dashboard</p>
          </div>
        </div>
        <div className="md:hidden">
          <AuthControls />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-3 md:block md:space-y-1 md:p-4">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition md:w-full md:gap-3 md:px-4 md:py-3',
              active === id
                ? 'bg-brand-primary/15 text-brand-primary'
                : 'text-slate-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto hidden space-y-3 border-t border-emerald-500/10 p-4 md:block">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <Home className="h-4 w-4" />
          Landing
        </Link>
        <AuthControls />
        {isConnected && address && (
          <p className="truncate px-4 font-mono text-[10px] text-slate-600">{address}</p>
        )}
      </div>
    </aside>
  );
}
