'use client';

import { useAuth, SignInButton, UserButton } from '@clerk/nextjs';
import { ConnectWallet } from '@/components/ConnectWallet';
import { cn } from '@/lib/utils';

interface AuthControlsProps {
  className?: string;
}

/** Clerk account auth + MetaMask wallet connect */
export function AuthControls({ className }: AuthControlsProps) {
  const { isSignedIn } = useAuth();

  return (
    <div className={cn('flex items-center gap-2 sm:gap-3', className)}>
      {!isSignedIn ? (
        <SignInButton mode="modal">
          <button
            type="button"
            className="rounded-full border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
          >
            Sign In
          </button>
        </SignInButton>
      ) : (
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9 ring-2 ring-emerald-500/30',
            },
          }}
        />
      )}
      <ConnectWallet />
    </div>
  );
}
