'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PhilosophySection } from '@/components/landing/PhilosophySection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { MarketTicker } from '@/components/landing/MarketTicker';
import { VerifiedInteractionCursor } from '@/components/VerifiedInteractionCursor';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.replace('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <VerifiedInteractionCursor />
      <LandingNavbar />
      <MarketTicker />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PhilosophySection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
