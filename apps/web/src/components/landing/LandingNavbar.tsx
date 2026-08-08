'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { SovereignVaultLogo } from '@/components/SovereignVaultLogo';
import { cn } from '@/lib/utils';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-10 z-50 flex justify-center px-4">
      <nav
        className={cn(
          'pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full px-6 py-4 transition-all duration-500',
          scrolled
            ? 'border border-emerald-500/10 bg-[#0A1628]/90 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl'
            : 'bg-transparent',
        )}
      >
        <Link href="/" className="flex items-center gap-3">
          <SovereignVaultLogo size={40} />
          <span className="text-xl font-bold tracking-wide text-white">
            Sovereign<span className="font-normal text-brand-primary">X</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          {['Features', 'Compliance', 'Architecture'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="group relative text-slate-300 transition-colors hover:text-white"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand-primary transition-all group-hover:w-full" />
            </a>
          ))}
          <Link href="/dashboard" className="text-slate-300 hover:text-white">
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-dark sm:inline-block"
              >
                Open Vault
              </Link>
              <button
                type="button"
                onClick={() => disconnect()}
                className="rounded-full border border-emerald-500/30 px-4 py-2 text-xs text-emerald-300"
              >
                {address.slice(0, 6)}…{address.slice(-4)}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => connect({ connector: connectors[0] })}
              className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-bold text-brand-dark shadow-glow hover:brightness-110"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
