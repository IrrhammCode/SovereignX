'use client';

const items = [
  { label: 'US 3M T-Bill', yield: '5.28%', change: '+0.02' },
  { label: 'SOVX / USD', price: '$10.00', change: '0.00' },
  { label: 'Monad TPS', price: '10,000+', change: 'live' },
  { label: 'CVI Verified Wallets', price: '247', change: '+12' },
  { label: 'Total SOVX Supply', price: '1,000', change: 'SOVX' },
  { label: 'US 3M T-Bill', yield: '5.28%', change: '+0.02' },
  { label: 'SOVX / USD', price: '$10.00', change: '0.00' },
  { label: 'Monad TPS', price: '10,000+', change: 'live' },
];

export function MarketTicker() {
  return (
    <div className="fixed left-0 right-0 top-0 z-40 overflow-hidden border-b border-emerald-500/10 bg-[#0A1628]/95 py-2 backdrop-blur-md">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="font-semibold text-emerald-400">{item.label}</span>
            <span className="text-white">{item.price ?? item.yield}</span>
            <span className="text-emerald-500/70">{item.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
