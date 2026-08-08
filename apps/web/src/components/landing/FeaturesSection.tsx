'use client';

import { GlowCard } from '@/components/ui/GlowCard';
import { ShieldCheck, Vault, Globe, FileCheck } from 'lucide-react';

const features = [
  {
    title: 'SOVX Token',
    desc: 'Fractionalized US T-Bills from $10. Whole-fraction minting and transfers enforced on-chain.',
    icon: Vault,
    wide: true,
  },
  {
    title: 'Cleanverse CVI',
    desc: 'Every wallet verified via A-Pass before it can send or receive SOVX.',
    icon: ShieldCheck,
    tall: true,
  },
  {
    title: 'CCP Protocol',
    desc: 'Pre-transaction compliance checks with IVMS 101 Travel Rule payloads.',
    icon: FileCheck,
  },
  {
    title: 'Monad Execution',
    desc: 'High-throughput parallel EVM settlement with sub-second finality.',
    icon: Globe,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 bg-brand-dark px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <h2 className="mb-6 text-5xl font-extrabold tracking-tighter md:text-6xl">
            RWA Yield, <span className="text-gradient">Verified.</span>
          </h2>
          <p className="text-xl font-light text-slate-400">
            Compliance-native tokenization — CVI identity, CVA settlement, and ERC-3643 transfer restrictions from issuance.
          </p>
        </div>

        <div className="grid auto-rows-[320px] grid-cols-1 gap-6 md:grid-cols-3">
          <GlowCard className="bg-gradient-to-br from-sovereign-blue/80 to-emerald-950/40 md:col-span-2">
            <div className="flex h-full flex-col justify-between p-10">
              <Vault className="mb-4 h-12 w-12 text-brand-primary" />
              <div>
                <h3 className="mb-3 text-3xl font-bold text-white">{features[0].title}</h3>
                <p className="max-w-lg text-lg leading-relaxed text-slate-300">{features[0].desc}</p>
              </div>
            </div>
          </GlowCard>

          <GlowCard delay={0.1} className="bg-gradient-to-b from-emerald-900/20 to-sovereign-blue/60 md:row-span-2">
            <div className="flex h-full flex-col justify-end p-10">
              <ShieldCheck className="mb-4 h-12 w-12 text-brand-primary" />
              <h3 className="mb-3 text-3xl font-bold text-white">{features[1].title}</h3>
              <p className="mb-4 text-lg text-slate-300">{features[1].desc}</p>
              <div className="rounded-xl border border-emerald-500/10 bg-black/40 px-4 py-3 font-mono text-xs text-emerald-400">
                CVI Status: VERIFIED · Tier 3 · US
              </div>
            </div>
          </GlowCard>

          {features.slice(2).map((f, i) => (
            <GlowCard key={f.title} delay={0.15 + i * 0.05} className="bg-sovereign-surface/80 p-10">
              <f.icon className="mb-4 h-10 w-10 text-brand-primary opacity-90" />
              <h3 className="mb-2 text-2xl font-bold text-white">{f.title}</h3>
              <p className="text-slate-400">{f.desc}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
