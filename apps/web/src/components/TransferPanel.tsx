'use client';

import { useState } from 'react';
import { parseUnits } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sovxTokenAbi, MIN_FRACTION_UNITS } from '@sovereignx/shared';
import { preCheckTransfer, syncCVI, logTransferOnChain, fetchTravelRule } from '@/lib/api';
import { SOVX, useSOVXBalance, formatSOVX } from '@/lib/contracts';

interface TransferPanelProps {
  address?: `0x${string}`;
}

export function TransferPanel({ address }: TransferPanelProps) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('10');
  const [status, setStatus] = useState<string | null>(null);
  const [ivms101, setIvms101] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: balance } = useSOVXBalance(address);
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash });

  async function handleSyncCVI() {
    if (!address) return;
    setLoading(true);
    setStatus(null);
    try {
      const r = await syncCVI(address);
      setStatus(r.synced ? `CVI synced on-chain${r.txHash ? `: ${r.txHash.slice(0, 10)}…` : ''}` : `Sync failed: ${r.reason}`);
    } catch {
      setStatus('CVI sync request failed');
    } finally {
      setLoading(false);
    }
  }

  async function handlePreCheck() {
    if (!address || !to) return;
    setLoading(true);
    setStatus(null);
    setIvms101(null);
    try {
      const result = await preCheckTransfer(address, to, Number(amount));
      if (result.allowed) {
        setStatus('CCP PASSED — ready for on-chain transfer');
        setIvms101(result.ivms101 ?? null);
      } else {
        setStatus(`BLOCKED: ${result.message}`);
      }
    } catch {
      setStatus('Compliance check failed — transfer would REVERT on-chain');
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer() {
    if (!address || !to || !SOVX) return;
    setStatus(null);
    try {
      const units = parseUnits(amount, 6);
      if (units < MIN_FRACTION_UNITS || units % MIN_FRACTION_UNITS !== 0n) {
        setStatus('Amount must be whole $10 fractions');
        return;
      }

      const pre = await preCheckTransfer(address, to, Number(amount));
      if (!pre.allowed) {
        setStatus(`BLOCKED: ${pre.message}`);
        return;
      }

      const hash = await writeContractAsync({
        address: SOVX,
        abi: sovxTokenAbi,
        functionName: 'transfer',
        args: [to as `0x${string}`, units],
      });

      setStatus(`Transfer submitted: ${hash.slice(0, 14)}…`);
      await logTransferOnChain({
        txHash: hash,
        from: address,
        to,
        amount,
        ccpPassed: true,
        ivms101: pre.ivms101,
      });
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'On-chain transfer reverted');
    }
  }

  const busy = loading || isPending || confirming;

  return (
    <div className="vault-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-sovereign-green">
          Transfer SOVX
        </h2>
        <span className="text-xs text-gray-400">Balance: {formatSOVX(balance)}</span>
      </div>

      {!SOVX && (
        <p className="mb-3 text-xs text-yellow-400">Deploy contracts and set NEXT_PUBLIC_SOVX_TOKEN_ADDRESS</p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-xs text-gray-500">
          Recipient
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x…"
            className="mt-1 w-full rounded-lg border border-sovereign-green/20 bg-sovereign-navy px-3 py-2 text-sm text-white outline-none focus:border-sovereign-green"
          />
        </label>
        <label className="block text-xs text-gray-500">
          Amount (USD, min $10)
          <input
            type="number"
            min={10}
            step={10}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sovereign-green/20 bg-sovereign-navy px-3 py-2 text-sm text-white outline-none focus:border-sovereign-green"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          disabled={!address || busy}
          onClick={handleSyncCVI}
          className="rounded-xl border border-sovereign-green/40 py-2.5 text-sm text-sovereign-green disabled:opacity-40"
        >
          Sync CVI On-Chain
        </button>
        <button
          type="button"
          disabled={!address || busy}
          onClick={handlePreCheck}
          className="rounded-xl border border-sovereign-green/40 py-2.5 text-sm text-white disabled:opacity-40"
        >
          CCP Pre-Check
        </button>
        <button
          type="button"
          disabled={!address || !SOVX || busy}
          onClick={handleTransfer}
          data-verified-action
          className="rounded-xl bg-sovereign-green py-2.5 text-sm font-semibold text-sovereign-navy disabled:opacity-40"
        >
          {isPending || confirming ? 'Confirming…' : 'Execute Transfer'}
        </button>
      </div>

      {status && (
        <p
          className={`mt-3 text-sm ${
            status.startsWith('BLOCKED') || status.includes('failed') || status.includes('revert')
              ? 'text-red-400'
              : 'text-sovereign-glow'
          }`}
        >
          {status}
        </p>
      )}
      {ivms101 && (
        <details className="mt-3 rounded-lg border border-sovereign-green/20 bg-sovereign-navy/60 p-3 text-xs">
          <summary className="cursor-pointer text-sovereign-green">IVMS 101 Payload</summary>
          <pre className="mt-2 overflow-auto text-gray-400">{JSON.stringify(ivms101, null, 2)}</pre>
          {address && (
            <TravelRuleLink address={address} />
          )}
        </details>
      )}
    </div>
  );
}

function TravelRuleLink({ address }: { address: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const r = await fetchTravelRule(address);
    if (r.url) setUrl(r.url);
    else setErr(r.error ?? 'Travel rule unavailable');
  }

  return (
    <div className="mt-3 border-t border-sovereign-green/10 pt-3">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-sovereign-glow hover:underline">
          Download Cleanverse Travel Rule →
        </a>
      ) : (
        <button type="button" onClick={load} className="text-sovereign-green hover:underline">
          Fetch Travel Rule from Cleanverse
        </button>
      )}
      {err && <p className="mt-1 text-red-400">{err}</p>}
    </div>
  );
}
