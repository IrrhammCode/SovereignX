'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConnectWallet } from '@/components/ConnectWallet';

export function CTASection() {
  return (
    <section className="relative px-6 py-32">
      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-6 text-4xl font-extrabold tracking-tighter md:text-6xl">
          Ready to access <span className="text-gradient">verified yield</span>?
        </h2>
        <p className="mb-10 text-lg text-slate-400">
          Connect your wallet on Monad testnet, enroll A-Pass via Cleanverse, and start holding SOVX.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ConnectWallet />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full glass-pill px-10 py-4 text-lg font-medium text-white transition hover:bg-white/10"
          >
            Open Dashboard
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
