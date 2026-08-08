import type { Metadata } from 'next';
import { Outfit, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { NetworkGuard } from '@/components/NetworkGuard';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  title: 'SovereignX — Verified US T-Bills on Monad',
  description: 'Fractionalized US Treasury Bills with ERC-3643 compliance powered by Cleanverse',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${robotoMono.variable}`}>
      <body className="font-sans">
        <Providers>
          {children}
          <NetworkGuard />
        </Providers>
      </body>
    </html>
  );
}
