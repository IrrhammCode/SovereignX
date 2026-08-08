'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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
          Connect your wallet, enroll your A-Pass, and start holding SOVX on Monad testnet.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-10 py-4 text-lg font-bold text-brand-dark shadow-glow transition hover:scale-105"
        >
          Open Dashboard <ArrowRight className="h-5 w-5" />
        </Link>
      </motion.div>
    </section>
  );
}
