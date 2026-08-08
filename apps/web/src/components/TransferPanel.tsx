'use client';

import { useState } from 'react';
import { preCheckTransfer } from '@/lib/api';

interface TransferPanelProps {
  address?: string;
}

export function TransferPanel({ address }: TransferPanelProps) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('10');
  const [status, setStatus] = useState<string | null>(null);
  const [ivms101, setIvms101] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="vault-panel p-5">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-sovereign-green">
        Transfer SOVX
      </h2>
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
      <button
        type="button"
        disabled={!address || loading}
        onClick={handlePreCheck}
        className="mt-4 w-full rounded-xl bg-sovereign-green py-2.5 text-sm font-semibold text-sovereign-navy disabled:opacity-40"
      >
        {loading ? 'Running CCP Check…' : 'Pre-Validate via Cleanverse CCP'}
      </button>
      {status && (
        <p
          className={`mt-3 text-sm ${
            status.startsWith('BLOCKED') ? 'text-red-400' : 'text-sovereign-glow'
          }`}
        >
          {status}
        </p>
      )}
      {ivms101 && (
        <details className="mt-3 rounded-lg border border-sovereign-green/20 bg-sovereign-navy/60 p-3 text-xs">
          <summary className="cursor-pointer text-sovereign-green">IVMS 101 Payload</summary>
          <pre className="mt-2 overflow-auto text-gray-400">{JSON.stringify(ivms101, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
