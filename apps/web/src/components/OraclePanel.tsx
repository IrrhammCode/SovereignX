'use client';

import { useEffect, useState } from 'react';
import { fetchOracle } from '@/lib/api';

export function OraclePanel() {
  const [quote, setQuote] = useState<{
    navPerShare: number;
    yieldRate: number;
    lastUpdated: string;
  } | null>(null);

  useEffect(() => {
    fetchOracle().then(setQuote).catch(() => null);
  }, []);

  return (
    <div className="vault-panel p-5">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-sovereign-green">
        T-Bill Oracle
      </h2>
      {quote ? (
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">NAV / Share</dt>
            <dd className="font-mono text-white">${quote.navPerShare.toFixed(4)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Yield</dt>
            <dd className="font-mono text-sovereign-glow">{quote.yieldRate}% APY</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Updated</dt>
            <dd className="text-xs text-gray-400">
              {new Date(quote.lastUpdated).toLocaleString()}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-gray-500">Loading oracle…</p>
      )}
    </div>
  );
}
