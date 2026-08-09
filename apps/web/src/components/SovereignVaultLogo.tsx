'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SovereignVaultLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/** SovereignX brand logo (shield + wordmark) */
export function SovereignVaultLogo({
  size = 48,
  className,
  priority = false,
}: SovereignVaultLogoProps) {
  return (
    <Image
      src="/sovereignx-logo.png"
      alt="SovereignX"
      width={size}
      height={size}
      priority={priority}
      className={cn('object-contain', className)}
      style={{ width: size, height: size }}
    />
  );
}
