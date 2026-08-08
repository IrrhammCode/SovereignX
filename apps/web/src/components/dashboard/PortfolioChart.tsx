'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { GlowCard } from '@/components/ui/GlowCard';
import { fetchOracleHistory } from '@/lib/api';

export function PortfolioChart() {
  const [data, setData] = useState<Array<{ label: string; nav: number }>>([]);
  const [ytd, setYtd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOracleHistory()
      .then((history) => {
        const points = history.map((h) => ({
          label: h.date.slice(5),
          nav: h.nav,
        }));
        setData(points);
        if (points.length >= 2) {
          const first = points[0].nav;
          const last = points[points.length - 1].nav;
          const pct = ((last - first) / first) * 100;
          setYtd(`${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load NAV history'));
  }, []);

  const domain = data.length
    ? [Math.min(...data.map((d) => d.nav)) * 0.999, Math.max(...data.map((d) => d.nav)) * 1.001]
    : [9.99, 10.01];

  return (
    <GlowCard className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">SOVX NAV History</h3>
          <p className="text-xs text-slate-500">Live T-Bill accrual · $10 base fraction</p>
        </div>
        {ytd && (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-400">
            {ytd} period
          </span>
        )}
      </div>
      {error ? (
        <p className="text-sm text-yellow-400">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-500">NAV history builds as the oracle records daily snapshots.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A36C" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00A36C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                domain={domain}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  background: '#0A1628',
                  border: '1px solid rgba(0,163,108,0.2)',
                  borderRadius: 12,
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area
                type="monotone"
                dataKey="nav"
                stroke="#00A36C"
                strokeWidth={2}
                fill="url(#navGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlowCard>
  );
}
