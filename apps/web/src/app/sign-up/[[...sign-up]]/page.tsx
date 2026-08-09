import { SignUp } from '@clerk/nextjs';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { clerkAuthFormAppearance } from '@/lib/clerk-appearance';

export default function SignUpPage() {
  return (
    <AuthPageShell
      eyebrow="Create account"
      title="Join SovereignX"
      description="Register with Google or email. You'll still need MetaMask connected to access the vault."
    >
      <SignUp
        appearance={clerkAuthFormAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </AuthPageShell>
  );
}
