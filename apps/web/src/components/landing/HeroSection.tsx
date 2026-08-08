'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Shield, Sparkles } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { SovereignVaultLogo } from '@/components/SovereignVaultLogo';

export function HeroSection() {
  const { isConnected } = useAccount();
  const router = useRouter();

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-12 pt-32">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] animate-float rounded-full bg-brand-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[600px] w-[600px] animate-float-delayed rounded-full bg-brand-secondary/40 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-5xl flex-grow text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-10 inline-flex items-center gap-2 rounded-full glass-pill px-5 py-2.5 text-sm font-semibold text-emerald-300 shadow-vault"
        >
          <Sparkles className="h-4 w-4" />
          <span>
            Fractional US T-Bills on <strong className="text-white">Monad</strong>
          </span>
        </motion.div>

        <motion.h1
          className="mb-8 text-5xl font-extrabold leading-[1.05] tracking-tighter sm:text-7xl md:text-8xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          Institutional Security.
          <br className="hidden md:block" />
          <span className="text-gradient inline-block pb-2 drop-shadow-glow">
            Web3 Liquidity.
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mb-12 max-w-3xl text-lg font-light leading-relaxed text-slate-400 md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          SovereignX tokenizes US Treasury Bills from <strong className="text-slate-200">$10 fractions</strong>,
          with ERC-3643 permissioned transfers and Cleanverse CVI/CVA compliance baked into every SOVX move.
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            data-verified-action
            onClick={() => router.push('/dashboard')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-8 py-4 text-base font-bold text-brand-dark shadow-glow transition hover:scale-105 sm:w-auto"
          >
            {isConnected ? 'Enter Vault Dashboard' : 'Launch App'}
            <ArrowRight className="h-5 w-5" />
          </button>
          <a
            href="#architecture"
            className="flex w-full items-center justify-center gap-2 rounded-full glass-pill px-8 py-4 text-base font-medium text-white transition hover:bg-white/10 sm:w-auto"
          >
            View Architecture <ChevronDown className="h-5 w-5" />
          </a>
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 mx-auto mt-16 w-full max-w-5xl border-t border-white/5 pt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Powered by Verified Infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 md:gap-14">
          {['Monad', 'Cleanverse CVI', 'Cleanverse CVA', 'ERC-3643'].map((name) => (
            <div key={name} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
              {name === 'Monad' && <SovereignVaultLogo size={28} />}
              {name !== 'Monad' && <Shield className="h-5 w-5 text-brand-primary" />}
              {name}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
