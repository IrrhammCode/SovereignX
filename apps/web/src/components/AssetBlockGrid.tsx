'use client';

import { VisualAssetBlock } from './VisualAssetBlock';

const DEMO_FRACTIONS = 12;

export function AssetBlockGrid() {
  return (
    <div className="vault-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-sovereign-green">
          Fractional T-Bill Blocks
        </h2>
        <span className="text-xs text-gray-500">$10 per block · SOVX</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: DEMO_FRACTIONS }, (_, i) => (
          <VisualAssetBlock key={i} index={i + 1} connected={i > 0 && i % 3 === 0} />
        ))}
      </div>
    </div>
  );
}
