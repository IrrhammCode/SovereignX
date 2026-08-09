'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Coins, ExternalLink, Loader2 } from 'lucide-react';
import { claimDemoSovx, fetchSovxFaucetStatus, type SovxFaucetStatus } from '@/lib/api';

interface SovxClaimPanelProps {
  address?: `0x${string}`;
}

export function SovxClaimPanel({ address }: SovxClaimPanelProps) {
  const [status, setStatus] = useState<SovxFaucetStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const load = useCallback(async () => {
    if (!address) {
      setStatus(null);
      return;
    }
    setLoading(true);
    try {
      setStatus(await fetchSovxFaucetStatus(address));
    } catch {
      setStatus(null);
      setMessage('Could not load claim status — is the API online?');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleClaim() {
    if (!address || !status?.eligible || status.claimed) return;
    setClaiming(true);
    setMessage(null);
    try {
      const result = await claimDemoSovx(address);
      if (result.txHash) {
        setMessage(`Claimed ${result.fractions ?? 2} × $10 SOVX — balance updates shortly.`);
        await queryClient.invalidateQueries({ queryKey: ['readContract'] });
        await load();
      } else {
        setMessage(result.error ?? 'Claim failed');
      }
    } catch {
      setMessage('Claim request failed');
    } finally {
      setClaiming(false);
    }
  }

  if (!address) return null;

  return (
    <div className="vault-panel p-5">
      <div className="mb-3 flex items-center gap-2">
        <Coins className="h-4 w-4 text-sovereign-green" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-sovereign-green">
          Demo SOVX Faucet
        </h2>
      </div>
      <p className="text-xs text-gray-400">
        Verified wallets can claim {status?.fractions ?? 2} × $10 demo fractions once — for judges and
        testnet users.
      </p>

      {loading && !status ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Checking eligibility…
        </p>
      ) : status?.claimed && status.txHash ? (
        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-black/30 p-3 text-sm">
          <p className="text-sovereign-glow">Demo SOVX already claimed (${status.amountUsd})</p>
          <a
            href={`https://testnet.monadscan.com/tx/${status.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-sovereign-green hover:underline"
          >
            View mint tx <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ) : status?.eligible ? (
        <button
          type="button"
          disabled={claiming}
          onClick={handleClaim}
          data-verified-action
          className="mt-3 w-full rounded-xl bg-sovereign-blue py-2.5 text-sm font-semibold text-sovereign-glow ring-1 ring-sovereign-green/30 hover:ring-sovereign-green disabled:opacity-50"
        >
          {claiming ? 'Minting demo SOVX…' : `Claim ${status.fractions} × $10 SOVX`}
        </button>
      ) : (
        <p className="mt-3 text-xs text-yellow-400/90">
          {status?.reason ?? 'Complete A-Pass enrollment, then Sync CVI on-chain to claim.'}
        </p>
      )}

      {message && (
        <p
          className={`mt-3 text-xs ${
            message.includes('Claimed') ? 'text-sovereign-glow' : 'text-red-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
