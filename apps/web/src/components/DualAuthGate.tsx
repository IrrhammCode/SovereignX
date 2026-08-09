'use client';

import { useAuth, SignInButton, UserButton, useClerk } from '@clerk/nextjs';
import { useAccount, useDisconnect } from 'wagmi';
import { CheckCircle2, Wallet, Mail, LogOut } from 'lucide-react';
import { ConnectWallet } from '@/components/ConnectWallet';
import { GlowCard } from '@/components/ui/GlowCard';
import { cn } from '@/lib/utils';

interface DualAuthGateProps {
  children: React.ReactNode;
  className?: string;
}

function StepRow({
  step,
  title,
  description,
  done,
  active,
  children,
}: {
  step: number;
  title: string;
  description: string;
  done: boolean;
  active: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition',
        done
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : active
            ? 'border-brand-primary/40 bg-brand-primary/5'
            : 'border-emerald-500/10 bg-black/20 opacity-60',
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            done
              ? 'bg-emerald-500/20 text-emerald-400'
              : active
                ? 'bg-brand-primary/20 text-brand-primary'
                : 'bg-slate-800 text-slate-500',
          )}
        >
          {done ? <CheckCircle2 className="h-5 w-5" /> : step}
        </div>
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>
      {active && !done && children}
      {done && (
        <p className="text-xs font-medium text-emerald-400">Completed</p>
      )}
    </div>
  );
}

function SessionLogoutControls({ className }: { className?: string }) {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { isConnected } = useAccount();
  const { disconnect, isPending: disconnecting } = useDisconnect();

  if (!isSignedIn && !isConnected) return null;

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      {isConnected && (
        <button
          type="button"
          disabled={disconnecting}
          onClick={() => disconnect()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          Disconnect wallet
        </button>
      )}
      {isSignedIn && (
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: '/dashboard' })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out Google
        </button>
      )}
    </div>
  );
}

/** Step 1: MetaMask · Step 2: Google (Clerk) */
export function DualAuthGate({ children, className }: DualAuthGateProps) {
  const { isSignedIn } = useAuth();
  const { isConnected, address } = useAccount();

  const walletDone = isConnected && !!address;
  const googleDone = !!isSignedIn;
  const fullyAuthed = walletDone && googleDone;

  if (fullyAuthed) {
    return <>{children}</>;
  }

  const currentStep = !walletDone ? 1 : 2;

  return (
    <div className={cn('flex min-h-[60vh] items-center justify-center py-12', className)}>
      <GlowCard className="w-full max-w-lg p-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
            Dual Verification
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">Sign in to SovereignX</h2>
          <p className="mt-2 text-sm text-slate-400">
            Complete both steps — wallet first, then Google account.
          </p>
        </div>

        <div className="space-y-4">
          <StepRow
            step={1}
            title="Connect MetaMask"
            description="Link your wallet on Monad Testnet for on-chain SOVX access."
            done={walletDone}
            active={currentStep === 1}
          >
            <div className="flex flex-col items-start gap-3">
              <ConnectWallet />
              <p className="text-[11px] text-slate-500">
                Chain ID 10143 · RPC https://testnet-rpc.monad.xyz
              </p>
            </div>
          </StepRow>

          <StepRow
            step={2}
            title="Sign in with Google"
            description="Verify your identity via Clerk before entering the vault."
            done={googleDone}
            active={currentStep === 2}
          >
            <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-[#132238] px-5 py-2.5 text-sm font-semibold text-white transition hover:border-emerald-500/50 hover:bg-emerald-500/10"
              >
                <Mail className="h-4 w-4" />
                Continue with Google
              </button>
            </SignInButton>
            <p className="mt-3 text-[11px] text-slate-500">
              Or use email on the next screen if you prefer.
            </p>
          </StepRow>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Wallet className="h-3.5 w-3.5" />
          <span>Step {currentStep} of 2</span>
        </div>

        <SessionLogoutControls className="mt-4 border-t border-emerald-500/10 pt-4" />
      </GlowCard>
    </div>
  );
}

/** Navbar: Step 1 MetaMask → Step 2 Google */
export function DualAuthControls({ className }: { className?: string }) {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { isConnected, address } = useAccount();
  const { disconnect, isPending: disconnecting } = useDisconnect();
  const walletDone = isConnected && !!address;

  if (!walletDone) {
    return (
      <div className={cn('flex flex-col items-end gap-2', className)}>
        <div className="flex items-center gap-2">
          <ConnectWallet />
          {!isSignedIn ? (
            <span className="hidden text-[10px] font-medium text-amber-300/90 sm:inline">
              1/2 Wallet
            </span>
          ) : (
            <span className="hidden text-[10px] font-medium text-emerald-400/90 sm:inline">
              Google OK · connect wallet
            </span>
          )}
        </div>
        {isSignedIn && (
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: '/dashboard' })}
            className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-300"
          >
            <LogOut className="h-3 w-3" />
            Sign out Google
          </button>
        )}
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={cn('flex flex-col items-end gap-2', className)}>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-300 sm:inline">
            {address!.slice(0, 6)}…{address!.slice(-4)}
          </span>
          <button
            type="button"
            disabled={disconnecting}
            onClick={() => disconnect()}
            title="Disconnect wallet"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 px-2.5 py-1.5 text-[10px] text-slate-400 hover:border-red-500/30 hover:text-red-300 disabled:opacity-50"
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline">Wallet</span>
          </button>
          <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#132238] px-4 py-2 text-xs font-semibold text-white transition hover:border-emerald-500/50 hover:bg-emerald-500/10"
            >
              <Mail className="h-3.5 w-3.5" />
              Google Sign In
            </button>
          </SignInButton>
          <span className="hidden text-[10px] font-medium text-amber-300/90 sm:inline">
            2/2 Google
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-end gap-2', className)}>
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-300 sm:inline">
          {address!.slice(0, 6)}…{address!.slice(-4)}
        </span>
        <button
          type="button"
          disabled={disconnecting}
          onClick={() => disconnect()}
          title="Disconnect wallet"
          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 px-2.5 py-1.5 text-[10px] text-slate-400 hover:border-red-500/30 hover:text-red-300 disabled:opacity-50"
        >
          <LogOut className="h-3 w-3" />
          <span className="hidden sm:inline">Wallet</span>
        </button>
        <UserButton
          appearance={{
            elements: { avatarBox: 'h-9 w-9 ring-2 ring-emerald-500/30' },
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => signOut({ redirectUrl: '/dashboard' })}
        className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-300"
      >
        <LogOut className="h-3 w-3" />
        Sign out Google
      </button>
    </div>
  );
}
