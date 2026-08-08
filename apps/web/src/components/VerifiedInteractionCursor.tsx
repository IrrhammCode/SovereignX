'use client';

import { useEffect, useState } from 'react';
import { SovereignVaultLogo } from './SovereignVaultLogo';

/**
 * Verified Interaction Cursor — glowing concentric rings + vault seal + compliance label.
 * Follows pointer when user interacts with verified actions.
 */
export function VerifiedInteractionCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const verified =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[data-verified-action]');
      setActive(!!verified);
      setVisible(!!verified);
    };

    const onUp = () => setActive(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
      aria-hidden
    >
      {/* Outer ring */}
      <div
        className={`absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sovereign-green/30 ${
          active ? 'animate-pulseGlow' : ''
        }`}
      />
      {/* Spinning ring */}
      <div
        className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-sovereign-glow/40 animate-ringSpin"
      />
      {/* Vault seal center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.45]">
        <SovereignVaultLogo size={64} />
      </div>
      {/* Label */}
      <div className="absolute left-1/2 top-full mt-8 -translate-x-1/2 whitespace-nowrap rounded-lg border border-sovereign-green/40 bg-sovereign-blue/95 px-3 py-1.5 text-center shadow-vault backdrop-blur-sm">
        <p className="text-[10px] font-bold tracking-widest text-sovereign-glow glow-text">
          SOVEREIGNX VERIFIED ACTION
        </p>
        <p className="text-[9px] text-gray-400">IVMS 101 · CVI · CCP</p>
      </div>
    </div>
  );
}
