'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/GlowCard';
import { fetchProtocolStats } from '@/lib/api';

export function ProtocolStatsSection() {
  const [stats, setStats] = useState<{
    yield: string;
    nav: string;
    supply: string;
    network: string;
  } | null>(null);

  useEffect(() => {
    fetchProtocolStats()
      .then((s) =>
        setStats({
          yield: `${s.yieldRate.toFixed(2)}% APY`,
          nav: `$${s.navPerShare.toFixed(4)}`,
          supply: s.totalSupplyFormatted,
          network: `${s.chainName} · ${s.oracleSource}`,
        }),
      )
      .catch(() => setStats(null));
  }, []);

  const items = stats
    ? [
        { label: 'T-Bill Yield', value: stats.yield },
        { label: 'SOVX NAV', value: stats.nav },
        { label: 'Total Supply', value: stats.supply },
        { label: 'Network', value: stats.network },
      ]
    : [
        { label: 'T-Bill Yield', value: '—' },
        { label: 'SOVX NAV', value: '—' },
        { label: 'Total Supply', value: '—' },
        { label: 'Network', value: '—' },
      ];

  return (
    <section className="relative z-10 px-6 pb-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item, i) => (
          <GlowCard key={item.label} delay={i * 0.05} className="p-5 text-center">
            <motion.p
              className="text-2xl font-bold text-white md:text-3xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {item.value}
            </motion.p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {item.label}
            </p>
          </GlowCard>
        ))}
      </div>
    </section>
  );
}
