import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { SovereignVaultLogo } from '@/components/SovereignVaultLogo';
import { clerkAppearance } from '@/lib/clerk-appearance';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <SovereignVaultLogo size={40} />
        <span className="text-xl font-bold text-white">
          Sovereign<span className="text-brand-primary">X</span>
        </span>
      </Link>
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}
