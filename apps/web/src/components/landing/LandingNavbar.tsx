'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Menu, X } from 'lucide-react';
import { SovereignVaultLogo } from '@/components/SovereignVaultLogo';
import { AuthControls } from '@/components/AuthControls';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Compliance', href: '#compliance' },
  { label: 'Architecture', href: '#how-it-works' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-11 z-50 flex justify-center px-4">
        <nav
          className={cn(
            'pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full px-4 py-3 transition-all duration-500 sm:px-6 sm:py-4',
            scrolled
              ? 'border border-emerald-500/10 bg-[#0A1628]/90 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl'
              : 'bg-transparent',
          )}
        >
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <SovereignVaultLogo size={36} />
            <span className="text-lg font-bold tracking-wide text-white sm:text-xl">
              Sovereign<span className="font-normal text-brand-primary">X</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
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

          <div className="flex items-center gap-2 sm:gap-3">
            {isConnected && (
              <Link
                href="/dashboard"
                className="hidden rounded-full bg-brand-primary/15 px-3 py-2 text-xs font-semibold text-brand-primary ring-1 ring-brand-primary/30 sm:inline-block"
              >
                Open Vault
              </Link>
            )}
            <AuthControls />
            <button
              type="button"
              className="rounded-lg p-2 text-slate-300 hover:bg-white/5 md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-4 top-24 z-40 rounded-2xl border border-emerald-500/10 bg-[#0A1628]/95 p-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-brand-primary hover:bg-brand-primary/10"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
