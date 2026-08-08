'use client';

import { useEffect, useState } from 'react';
import type { CVIRecord } from '@sovereignx/shared';
import { fetchCVI } from '@/lib/api';

interface ComplianceStatusWidgetProps {
  address?: string;
}

export function ComplianceStatusWidget({ address }: ComplianceStatusWidgetProps) {
  const [cvi, setCvi] = useState<CVIRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setCvi(null);
      return;
    }
    setLoading(true);
    fetchCVI(address)
      .then(setCvi)
      .catch(() => setCvi(null))
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
          <p className="mt-1 text-lg font-semibold text-sovereign-glow">Eligible</p>
          <p className="mt-1 text-xs text-gray-500">
            Dividends distributed via Cleanverse Verified Assets (A-Token)
          </p>
        </div>
      </div>
    </div>
  );
}
