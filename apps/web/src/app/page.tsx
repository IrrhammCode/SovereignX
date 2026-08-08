'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProtocolStatsSection } from '@/components/landing/ProtocolStatsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PhilosophySection } from '@/components/landing/PhilosophySection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { MarketTicker } from '@/components/landing/MarketTicker';
import { VerifiedInteractionCursor } from '@/components/VerifiedInteractionCursor';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden pt-9">
      <VerifiedInteractionCursor />
      <MarketTicker />
      <LandingNavbar />
      <HeroSection />
      <ProtocolStatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PhilosophySection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
