import { SignIn } from '@clerk/nextjs';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { clerkAuthFormAppearance } from '@/lib/clerk-appearance';

export default function SignInPage() {
  return (
    <AuthPageShell
      eyebrow="Step 2 · Identity"
      title="Sign in with Google"
      description="Complete verification after connecting your MetaMask wallet. Use Google or email to continue."
    >
      <SignIn
        appearance={clerkAuthFormAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
    </AuthPageShell>
  );
}
