'use client';

import { GlowCard } from '@/components/ui/GlowCard';
import { TrendingUp, Wallet, Shield, Coins } from 'lucide-react';
import { useChainId } from 'wagmi';
import { formatSOVX } from '@/lib/contracts';
import { monadTestnet } from '@/lib/chains';

interface StatCardsProps {
  balance?: bigint;
  cviStatus?: string;
  yieldRate?: number | null;
}

export function DashboardStatCards({ balance, cviStatus = '—', yieldRate = null }: StatCardsProps) {
  const chainId = useChainId();
  const networkLabel = chainId === monadTestnet.id ? 'Monad Testnet' : `Chain ${chainId}`;

  const cards = [
    {
      label: 'SOVX Balance',
      value: formatSOVX(balance),
      sub: '$10 per fraction',
      icon: Wallet,
      accent: 'text-brand-primary',
    },
    {
      label: 'Est. Yield',
      value: yieldRate != null ? `${yieldRate.toFixed(2)}%` : '—',
      sub: 'US 3M T-Bill APY',
      icon: TrendingUp,
      accent: 'text-emerald-400',
    },
    {
      label: 'CVI Status',
      value: cviStatus,
      sub: 'Cleanverse Identity',
      icon: Shield,
      accent: cviStatus === 'Verified' ? 'text-brand-accent' : 'text-yellow-400',
    },
    {
      label: 'Network',
      value: 'Monad',
      sub: networkLabel,
      icon: Coins,
      accent: 'text-slate-200',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => (
        <GlowCard key={c.label} delay={i * 0.05} className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{c.label}</span>
            <c.icon className={`h-5 w-5 ${c.accent}`} />
          </div>
          <p className={`text-2xl font-bold ${c.accent}`}>{c.value}</p>
          <p className="mt-1 text-xs text-slate-500">{c.sub}</p>
        </GlowCard>
      ))}
    </div>
  );
}
