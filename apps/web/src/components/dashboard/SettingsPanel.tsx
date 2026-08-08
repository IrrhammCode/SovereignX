'use client';

import { GlowCard } from '@/components/ui/GlowCard';
import { SOVX } from '@/lib/contracts';

const CONTRACTS = [
  { name: 'SOVX Token', env: 'NEXT_PUBLIC_SOVX_TOKEN_ADDRESS', value: SOVX },
  {
    name: 'Identity Registry',
    env: 'NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS',
    value: process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS,
  },
  {
    name: 'Compliance Engine',
    env: 'NEXT_PUBLIC_COMPLIANCE_ENGINE_ADDRESS',
    value: process.env.NEXT_PUBLIC_COMPLIANCE_ENGINE_ADDRESS,
  },
  {
    name: 'Dividend Distributor',
    env: 'NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS',
    value: process.env.NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS,
  },
];

export function SettingsPanel() {
  return (
    <GlowCard className="p-6">
      <h3 className="mb-4 text-lg font-bold text-white">Contract Addresses</h3>
      <p className="mb-6 text-sm text-slate-400">
        Deployed on Monad Testnet. Configure via root <code className="text-emerald-400">.env</code>.
      </p>
      <dl className="space-y-4">
        {CONTRACTS.map((c) => (
          <div key={c.name} className="rounded-xl border border-emerald-500/10 bg-black/30 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{c.name}</dt>
            <dd className="mt-1 break-all font-mono text-sm text-emerald-300">
              {c.value ?? <span className="text-yellow-400">Not configured</span>}
            </dd>
            <dd className="mt-1 text-[10px] text-slate-600">{c.env}</dd>
          </div>
        ))}
      </dl>
    </GlowCard>
  );
}
