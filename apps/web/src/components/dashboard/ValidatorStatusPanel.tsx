'use client';

import { useEffect, useState } from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { Shield } from 'lucide-react';
import { fetchValidatorStatus } from '@/lib/api';

export function ValidatorStatusPanel() {
  const [status, setStatus] = useState<{
    pool?: string;
    registered?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    fetchValidatorStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  return (
    <GlowCard className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-brand-primary" />
        <h3 className="font-bold text-white">Validator Pool</h3>
      </div>
      {status ? (
        <>
          <p className="text-sm text-slate-400">
            ComplianceEngine pool on Cleanverse:{' '}
            <span className={status.registered ? 'text-emerald-400' : 'text-yellow-400'}>
              {status.registered ? 'Registered' : 'Not registered'}
            </span>
          </p>
          <p className="mt-2 break-all font-mono text-[10px] text-slate-600">{status.pool}</p>
          {!status.registered && (
            <p className="mt-3 text-xs text-slate-500">
              Pool uses AccessControl (no <code className="text-slate-400">owner()</code>) — Cleanverse
              requires an Ownable contract signature. Run{' '}
              <code className="text-emerald-400">pnpm register:validator</code> for Ownable pools, or
              request manual registration via Cleanverse support.
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500">Unable to load validator status.</p>
      )}
    </GlowCard>
  );
}
