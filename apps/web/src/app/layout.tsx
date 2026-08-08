import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { VerifiedInteractionCursor } from '@/components/VerifiedInteractionCursor';

export const metadata: Metadata = {
  title: 'SovereignX — Verified US T-Bills on Monad',
  description: 'Fractionalized US Treasury Bills with ERC-3643 compliance powered by Cleanverse',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <VerifiedInteractionCursor />
        </Providers>
      </body>
    </html>
  );
}
