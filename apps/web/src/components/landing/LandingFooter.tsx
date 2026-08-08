import Link from 'next/link';
import { SovereignVaultLogo } from '@/components/SovereignVaultLogo';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <SovereignVaultLogo size={32} />
          <span className="font-bold text-white">
            Sovereign<span className="text-brand-primary">X</span>
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Cleanverse Build Hackathon · Track RWA · Monad Testnet
        </p>
        <div className="flex gap-6 text-sm text-slate-400">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <a href="https://github.com/IrrhammCode/SovereignX" target="_blank" rel="noreferrer" className="hover:text-white">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
