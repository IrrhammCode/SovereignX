'use client';

import { useEffect, useState } from 'react';
import { fetchProtocolStats } from '@/lib/api';

export function MarketTicker() {
  const [items, setItems] = useState<Array<{ label: string; value: string; change: string }>>([]);

  useEffect(() => {
    fetchProtocolStats()
      .then((s) => {
        setItems([
          { label: 'US 3M T-Bill', value: `${s.yieldRate.toFixed(2)}%`, change: s.oracleSource.toUpperCase() },
          { label: 'SOVX NAV', value: `$${s.navPerShare.toFixed(4)}`, change: 'live' },
          { label: 'Total SOVX Supply', value: s.totalSupplyFormatted.replace(' SOVX', ''), change: 'SOVX' },
          { label: 'Min Fraction', value: `$${s.minFractionUsd}`, change: 'USD' },
          { label: 'Network', value: s.chainName, change: `Chain ${s.chainId}` },
        ]);
      })
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  const doubled = [...items, ...items];

  return (
    <div className="fixed left-0 right-0 top-0 z-40 overflow-hidden border-b border-emerald-500/10 bg-[#0A1628]/95 py-2 backdrop-blur-md">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="font-semibold text-emerald-400">{item.label}</span>
            <span className="text-white">{item.value}</span>
            <span className="text-emerald-500/70">{item.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
