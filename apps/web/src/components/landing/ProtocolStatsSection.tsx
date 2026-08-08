'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/GlowCard';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function ProtocolStatsSection() {
  const [stats, setStats] = useState({
    yield: '5.28%',
    nav: '$10.00',
    supply: '1,000 SOVX',
    network: 'Monad Testnet',
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/oracle/tbill`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API}/api/health`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([oracle, health]) => {
        setStats((s) => ({
          ...s,
          yield: oracle?.yieldRate != null ? `${oracle.yieldRate}% APY` : s.yield,
          nav: oracle?.navPerShare != null ? `$${oracle.navPerShare.toFixed(2)}` : s.nav,
          network: health?.contracts?.sovxToken ? 'Monad · Live' : s.network,
        }));
      })
      .catch(() => null);
  }, []);

  const items = [
    { label: 'T-Bill Yield', value: stats.yield },
    { label: 'SOVX NAV', value: stats.nav },
    { label: 'Min Fraction', value: '$10.00' },
    { label: 'Network', value: stats.network },
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
