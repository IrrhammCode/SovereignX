'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { Web3Provider } from '@/components/Web3Provider';
import { clerkAppearance } from '@/lib/clerk-appearance';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <Web3Provider>{children}</Web3Provider>
    </ClerkProvider>
  );
}
