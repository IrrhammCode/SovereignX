'use client';

import { useEffect, useState } from 'react';
import type { CVIRecord } from '@sovereignx/shared';
import { fetchCVI, fetchDividendStatus } from '@/lib/api';

interface ComplianceStatusWidgetProps {
  address?: string;
}

export function ComplianceStatusWidget({ address }: ComplianceStatusWidgetProps) {
  const [cvi, setCvi] = useState<CVIRecord | null>(null);
  const [cvaEligible, setCvaEligible] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setCvi(null);
      setCvaEligible(null);
      return;
    }
    setLoading(true);
    Promise.all([
      fetchCVI(address).catch(() => null),
      fetchDividendStatus(address).catch(() => null),
    ])
      .then(([cviData, dividend]) => {
        setCvi(cviData);
        setCvaEligible(dividend?.eligible ?? false);
      })
      .finally(() => setLoading(false));
  }, [address]);

  const statusColor =
    cvi?.status === 'Verified'
      ? 'text-sovereign-glow'
      : cvi?.status === 'Sanctioned'
        ? 'text-red-400'
        : 'text-yellow-400';

  return (
    <div className="vault-panel p-5">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-sovereign-green">
        Compliance Status
      </h2>

      <div className="space-y-4">
        <div className="rounded-xl border border-sovereign-green/15 bg-sovereign-navy/60 p-4">
          <p className="text-xs text-gray-500">CVI Status</p>
          {loading ? (
            <p className="mt-1 text-sm text-gray-400">Querying Cleanverse…</p>
          ) : address ? (
            <p className={`mt-1 text-lg font-semibold ${statusColor}`}>
              {cvi?.status ?? 'Not Registered'}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Connect wallet</p>
          )}
          {cvi && (
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div>
                <dt>Tier</dt>
                <dd className="text-white">{cvi.tier}</dd>
              </div>
              <div>
                <dt>Group</dt>
                <dd className="text-white">{cvi.group}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="rounded-xl border border-sovereign-green/15 bg-sovereign-navy/60 p-4">
          <p className="text-xs text-gray-500">CVA Payout</p>
          {loading ? (
            <p className="mt-1 text-sm text-gray-400">Checking eligibility…</p>
          ) : (
            <p
              className={`mt-1 text-lg font-semibold ${cvaEligible ? 'text-sovereign-glow' : 'text-yellow-400'}`}
            >
              {cvaEligible ? 'Eligible' : 'Not Eligible'}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Verified via Cleanverse CVI + on-chain identity registry
          </p>
        </div>
      </div>
    </div>
  );
}
