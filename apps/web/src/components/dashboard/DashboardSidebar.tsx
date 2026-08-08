'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Vault,
  ArrowLeftRight,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  Home,
} from 'lucide-react';
import { SovereignVaultLogo } from '@/components/SovereignVaultLogo';
import { cn } from '@/lib/utils';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export type DashboardTab = 'overview' | 'vault' | 'transfer' | 'compliance' | 'audit' | 'settings';

interface DashboardSidebarProps {
  active: DashboardTab;
  onNavigate: (tab: DashboardTab) => void;
}

const navItems: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'vault', label: 'Vault', icon: Vault },
  { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar({ active, onNavigate }: DashboardSidebarProps) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-emerald-500/10 bg-[#0A1628]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-emerald-500/10 p-6">
        <SovereignVaultLogo size={36} />
        <div>
          <p className="font-bold text-white">
            Sovereign<span className="text-brand-primary">X</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Vault Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
              active === id
                ? 'bg-brand-primary/15 text-brand-primary'
                : 'text-slate-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="space-y-2 border-t border-emerald-500/10 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <Home className="h-4 w-4" />
          Landing
        </Link>

        {isConnected && address ? (
          <button
            type="button"
            onClick={() => disconnect()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            {address.slice(0, 6)}…{address.slice(-4)}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => connect({ connector: connectors[0] })}
            className="w-full rounded-xl bg-brand-primary py-2.5 text-sm font-bold text-brand-dark"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </aside>
  );
}
