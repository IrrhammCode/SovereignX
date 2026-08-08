'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { GlowCard } from '@/components/ui/GlowCard';

const data = [
  { month: 'Mar', nav: 9.98 },
  { month: 'Apr', nav: 9.99 },
  { month: 'May', nav: 10.0 },
  { month: 'Jun', nav: 10.01 },
  { month: 'Jul', nav: 10.02 },
  { month: 'Aug', nav: 10.04 },
];

export function PortfolioChart() {
  return (
    <GlowCard className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">SOVX NAV History</h3>
          <p className="text-xs text-slate-500">Mock T-Bill oracle · $10 base fraction</p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-400">
          +0.6% YTD
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00A36C" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#00A36C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              domain={[9.95, 10.1]}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
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
    </GlowCard>
  );
}
