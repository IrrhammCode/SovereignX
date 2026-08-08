'use client';

import { formatUnits } from 'viem';
import { VisualAssetBlock } from './VisualAssetBlock';
import { MIN_FRACTION_USD } from '@sovereignx/shared';

interface AssetBlockGridProps {
  balance?: bigint;
}

export function AssetBlockGrid({ balance }: AssetBlockGridProps) {
  const totalUsd = balance != null ? Number(formatUnits(balance, 6)) : 0;
  const fractionCount = Math.max(0, Math.floor(totalUsd / MIN_FRACTION_USD));
  const displayCount = Math.min(Math.max(fractionCount, 1), 24);

  return (
    <div className="vault-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-sovereign-green">
          Fractional T-Bill Blocks
        </h2>
        <span className="text-xs text-gray-500">
          {fractionCount > 0 ? `${fractionCount} × $10 SOVX` : 'Connect wallet · $10 per block'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: displayCount }, (_, i) => (
          <VisualAssetBlock
            key={i}
            index={i + 1}
            connected={i < fractionCount}
            dimmed={fractionCount === 0}
          />
        ))}
      </div>
      {fractionCount > displayCount && (
        <p className="mt-3 text-xs text-slate-500">
          Showing {displayCount} of {fractionCount} fractions
        </p>
      )}
    </div>
  );
}
