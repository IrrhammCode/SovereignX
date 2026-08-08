'use client';

import { GlowCard } from '@/components/ui/GlowCard';
import { motion } from 'framer-motion';

const steps = [
  { step: '01', title: 'Enroll A-Pass', desc: 'Complete Cleanverse identity verification via magic link enrollment.' },
  { step: '02', title: 'Sync CVI On-Chain', desc: 'Relayer registers your wallet in the IdentityRegistry on Monad.' },
  { step: '03', title: 'Hold SOVX', desc: 'Receive fractional T-Bill tokens — $10 per whole fraction.' },
  { step: '04', title: 'Transfer with CCP', desc: 'Pre-check compliance, then execute permissioned ERC-3643 transfer.' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tighter md:text-5xl">
            How <span className="text-gradient">SovereignX</span> Works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            From KYC enrollment to compliant on-chain settlement — every step is auditable.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <GlowCard key={s.step} delay={i * 0.08} className="p-8">
              <motion.span
                className="mb-4 block font-mono text-4xl font-bold text-brand-primary/40"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                {s.step}
              </motion.span>
              <h3 className="mb-2 text-xl font-bold text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{s.desc}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
