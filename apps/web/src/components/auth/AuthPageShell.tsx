import Link from 'next/link';
import { SovereignVaultLogo } from '@/components/SovereignVaultLogo';

interface AuthPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthPageShell({ eyebrow, title, description, children }: AuthPageShellProps) {
  return (
    <div className="clerk-auth-page relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-blue-900/20 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3 transition hover:opacity-90">
            <SovereignVaultLogo size={44} />
            <span className="text-2xl font-bold tracking-tight text-white">
              Sovereign<span className="text-brand-primary">X</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-slate-400">Verified US T-Bills on Monad</p>
        </div>

        <div className="rounded-3xl border border-emerald-500/15 bg-[#0A1628]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-xl font-bold text-white sm:text-2xl">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
          </div>

          <div className="clerk-auth-form">{children}</div>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 transition hover:text-emerald-400"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
