'use client';

interface VisualAssetBlockProps {
  index: number;
  connected?: boolean;
  dimmed?: boolean;
}

/** $10 fractionalized T-Bill visual block */
export function VisualAssetBlock({ index, connected, dimmed }: VisualAssetBlockProps) {
  return (
    <div
      className={`group relative rounded-xl border p-3 transition-all ${
        connected
          ? 'border-sovereign-glow/50 bg-sovereign-blue/50 shadow-vault'
          : dimmed
            ? 'border-sovereign-green/10 bg-sovereign-navy/40 opacity-50'
            : 'border-sovereign-green/20 bg-sovereign-navy/80 hover:border-sovereign-green/40'
      }`}
    >
      {connected && (
        <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-sovereign-glow" />
      )}
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-sovereign-blue text-xs font-bold text-sovereign-green">
        {index}
      </div>
      <p className="text-sm font-medium text-white">$10.00</p>
      <p className="text-[10px] text-gray-500">US T-Bill · SOVX</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-sovereign-blue">
        <div
          className="h-full bg-gradient-to-r from-sovereign-green to-sovereign-glow"
          style={{ width: `${60 + (index % 4) * 10}%` }}
        />
      </div>
    </div>
  );
}
