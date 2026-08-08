'use client';

import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/GlowCard';
import { Lock, Scale, Eye } from 'lucide-react';

const pillars = [
  {
    icon: Lock,
    title: 'Permissioned by Design',
    desc: 'ERC-3643 modifiers block unverified senders and receivers before any transfer executes.',
  },
  {
    icon: Scale,
    title: 'Regulatory Alignment',
    desc: 'Cleanverse CVI/CVA/CCP stack maps to real-world compliance workflows for RWA issuers.',
  },
  {
    icon: Eye,
    title: 'Glass-Box Auditability',
    desc: 'Every compliance decision and transfer attempt is logged — no black-box settlement.',
  },
];

export function PhilosophySection() {
  return (
    <section id="compliance" className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <GlowCard className="overflow-hidden bg-gradient-to-br from-sovereign-blue/60 to-brand-dark p-12 md:p-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-4xl font-extrabold tracking-tighter md:text-5xl">
                Compliance is the <span className="text-gradient">Product</span>
              </h2>
              <p className="text-lg leading-relaxed text-slate-300">
                SovereignX treats identity verification and transfer restrictions as first-class protocol features —
                not bolt-on middleware. Institutional yield deserves institutional guardrails.
              </p>
            </div>
            <div className="space-y-6">
              {pillars.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 rounded-2xl border border-emerald-500/10 bg-black/30 p-6"
                >
                  <p.icon className="h-8 w-8 shrink-0 text-brand-primary" />
                  <div>
                    <h3 className="mb-1 font-bold text-white">{p.title}</h3>
                    <p className="text-sm text-slate-400">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlowCard>
      </div>
    </section>
  );
}
