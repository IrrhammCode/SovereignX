'use client';

import { useEffect, useState } from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { Coins, Calendar, Wallet } from 'lucide-react';
import { fetchDividendStatus } from '@/lib/api';

interface DividendPanelProps {
  wallet?: string;
}

export function DividendPanel({ wallet }: DividendPanelProps) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchDividendStatus>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDividendStatus(wallet)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [wallet]);

  if (loading) {
    return (
      <GlowCard className="p-6">
        <p className="text-sm text-slate-500">Loading dividend data…</p>
      </GlowCard>
    );
  }

  if (!data) {
    return (
      <GlowCard className="p-6">
        <p className="text-sm text-yellow-400">Dividend API offline — start backend with pnpm dev:api</p>
      </GlowCard>
    );
  }

  return (
    <GlowCard className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <Coins className="h-6 w-6 text-brand-primary" />
        <div>
          <h3 className="text-lg font-bold text-white">CVA Dividend Yield</h3>
          <p className="text-xs text-slate-500">Cleanverse Verified Assets · ausdc payouts</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-500/10 bg-black/30 p-4">
          <p className="text-xs text-slate-500">Est. per $10 fraction</p>
          <p className="mt-1 text-xl font-bold text-brand-primary">${data.perFractionUsd}</p>
          <p className="text-[10px] text-slate-600">quarterly · mock oracle</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-black/30 p-4">
          <p className="text-xs text-slate-500">Distributor pool</p>
          <p className="mt-1 text-xl font-bold text-white">${data.poolBalanceUsd ?? '0'}</p>
          <p className="text-[10px] text-slate-600">CVA in contract</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-black/30 p-4">
          <p className="text-xs text-slate-500">Total distributed</p>
          <p className="mt-1 text-xl font-bold text-white">
            {Number(data.totalDistributed) > 0 ? data.totalDistributed : '—'}
          </p>
          <p className="text-[10px] text-slate-600">on-chain CVA units</p>
        </div>
      </div>

      {wallet && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
          <Wallet className="h-5 w-5 text-brand-primary" />
          <div>
            <p className="text-sm font-medium text-white">Your claimed dividends</p>
            <p className="font-mono text-xs text-emerald-300">${data.claimedUsd ?? '0'} CVA</p>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Calendar className="h-4 w-4" />
          T-Bill maturity schedule
        </div>
        <div className="space-y-2">
          {data.schedule?.map((s: { date: string; cusip: string; yield: number }) => (
            <div
              key={s.cusip}
              className="flex items-center justify-between rounded-lg border border-emerald-500/10 bg-black/20 px-3 py-2 text-sm"
            >
              <span className="text-slate-300">{s.date}</span>
              <span className="font-mono text-xs text-slate-500">{s.cusip}</span>
              <span className="text-brand-primary">{s.yield}%</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-slate-600">
        Dividends paid exclusively via CVA (A-Token) to CVI-verified wallets. Distributor:{' '}
        <span className="font-mono text-slate-500">{data.distributor?.slice(0, 10)}…</span>
      </p>
    </GlowCard>
  );
}
