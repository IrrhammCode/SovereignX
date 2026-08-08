'use client';

import { useEffect, useState } from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { CheckCircle2, XCircle, Download, RefreshCw } from 'lucide-react';
import { fetchAuditReport, getAuditDownloadUrl } from '@/lib/api';

interface AuditLogPanelProps {
  wallet?: string;
}

export function AuditLogPanel({ wallet }: AuditLogPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ totalTransfers: 0, blocked: 0, cleared: 0 });
  const [transfers, setTransfers] = useState<
    Array<{
      txHash: string;
      from: string;
      to: string;
      amount: string;
      ccpPassed: boolean;
    }>
  >([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const report = await fetchAuditReport(wallet);
      setSummary(report.summary);
      setTransfers(report.transfers ?? []);
    } catch {
      setError('API offline — start backend with pnpm dev:api');
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [wallet]);

  return (
    <GlowCard className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Compliance Audit Trail</h3>
          <p className="text-xs text-slate-500">
            {summary.cleared} cleared · {summary.blocked} blocked · {summary.totalTransfers} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/20 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <a
            href={getAuditDownloadUrl('json')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-3 py-2 text-xs font-semibold text-brand-dark"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </a>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-yellow-400">{error}</p>}

      <div className="space-y-3">
        {loading && transfers.length === 0 ? (
          <p className="text-sm text-slate-500">Loading audit logs…</p>
        ) : transfers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-emerald-500/20 p-8 text-center text-sm text-slate-500">
            No transfers logged yet. Execute a compliant SOVX transfer to populate the audit trail.
          </p>
        ) : (
          transfers.map((t) => {
            const Icon = t.ccpPassed ? CheckCircle2 : XCircle;
            const color = t.ccpPassed ? 'text-emerald-400' : 'text-red-400';
            return (
              <div
                key={t.txHash}
                className="flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-black/30 p-4"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">
                    Transfer {t.amount} SOVX {t.ccpPassed ? '· Cleared' : '· Blocked'}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">{t.txHash}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t.from.slice(0, 8)}… → {t.to.slice(0, 8)}…
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlowCard>
  );
}
