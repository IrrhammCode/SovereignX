'use client';

import { useEffect, useState } from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { ExternalLink } from 'lucide-react';
import { SOVX } from '@/lib/contracts';
import { fetchDeployments, getContractAddress, type Deployments } from '@/lib/deployments';

const CONTRACT_DEFS = [
  { name: 'SOVX Token', env: 'NEXT_PUBLIC_SOVX_TOKEN_ADDRESS', key: 'sovxToken' as const },
  { name: 'Identity Registry', env: 'NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS', key: 'identityRegistry' as const },
  { name: 'Compliance Engine', env: 'NEXT_PUBLIC_COMPLIANCE_ENGINE_ADDRESS', key: 'complianceEngine' as const },
  { name: 'Dividend Distributor', env: 'NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS', key: 'dividendDistributor' as const },
  { name: 'CVA Stablecoin', env: 'NEXT_PUBLIC_CVA_STABLECOIN_ADDRESS', key: 'cvaStablecoin' as const },
];

export function SettingsPanel() {
  const [deployments, setDeployments] = useState<Deployments | null>(null);

  useEffect(() => {
    fetchDeployments().then(setDeployments).catch(() => null);
  }, []);

  const explorer = deployments?.explorer ?? 'https://testnet.monadscan.com';

  return (
    <GlowCard className="p-6">
      <h3 className="mb-4 text-lg font-bold text-white">Contract Addresses</h3>
      <p className="mb-6 text-sm text-slate-400">
        Deployed on Monad Testnet (chain {deployments?.chainId ?? 10143}). Override via root{' '}
        <code className="text-emerald-400">.env</code> or use bundled{' '}
        <code className="text-emerald-400">deployments.json</code>.
      </p>
      <dl className="space-y-4">
        {CONTRACT_DEFS.map((c) => {
          const value =
            c.key === 'sovxToken'
              ? SOVX ?? getContractAddress(deployments, c.env, c.key)
              : getContractAddress(deployments, c.env, c.key);
          return (
            <div key={c.name} className="rounded-xl border border-emerald-500/10 bg-black/30 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{c.name}</dt>
              <dd className="mt-1 break-all font-mono text-sm text-emerald-300">
                {value ?? <span className="text-yellow-400">Not configured</span>}
              </dd>
              {value && (
                <a
                  href={`${explorer}/address/${value}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  View on explorer <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <dd className="mt-1 text-[10px] text-slate-600">{c.env}</dd>
            </div>
          );
        })}
      </dl>
    </GlowCard>
  );
}
