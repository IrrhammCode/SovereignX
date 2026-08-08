'use client';

interface SovereignVaultLogoProps {
  size?: number;
}

/** Vault motif logo — deep blue vault door with emerald seal */
export function SovereignVaultLogo({ size = 48 }: SovereignVaultLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SovereignX Vault"
    >
      <rect x="4" y="8" width="56" height="52" rx="6" fill="#002D62" stroke="#00A36C" strokeWidth="2" />
      <circle cx="32" cy="34" r="14" fill="#0A1628" stroke="#00A36C" strokeWidth="2" />
      <circle cx="32" cy="34" r="8" fill="#002D62" stroke="#00FF88" strokeWidth="1.5" />
      <rect x="30" y="22" width="4" height="24" rx="2" fill="#00A36C" />
      <path d="M32 18 L36 24 L28 24 Z" fill="#00FF88" opacity="0.9" />
      <rect x="8" y="12" width="48" height="3" rx="1" fill="#00A36C" opacity="0.35" />
    </svg>
  );
}
