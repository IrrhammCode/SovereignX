'use client';

import { useEffect, useState } from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  status: 'passed' | 'blocked' | 'pending';
  time: string;
  detail?: string;
}

const MOCK_LOGS: AuditEntry[] = [
  { id: '1', action: 'CCP Pre-Check', status: 'passed', time: '2 min ago', detail: 'Sender & receiver verified' },
  { id: '2', action: 'CVI Sync', status: 'passed', time: '15 min ago', detail: 'IdentityRegistry updated' },
  { id: '3', action: 'Transfer 10 SOVX', status: 'pending', time: '—', detail: 'Awaiting confirmation' },
  { id: '4', action: 'A-Pass Enrollment', status: 'passed', time: '1 hr ago', detail: 'Tier 3 · US jurisdiction' },
];

export function AuditLogPanel() {
  const [logs, setLogs] = useState<AuditEntry[]>(MOCK_LOGS);

  useEffect(() => {
    const stored = localStorage.getItem('sovx-audit');
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch {
        /* keep mock */
      }
    }
  }, []);

  const icon = {
    passed: CheckCircle2,
    blocked: XCircle,
    pending: Clock,
  };

  const color = {
    passed: 'text-emerald-400',
    blocked: 'text-red-400',
    pending: 'text-yellow-400',
  };

  return (
    <GlowCard className="p-6">
      <h3 className="mb-4 text-lg font-bold text-white">Compliance Audit Trail</h3>
      <div className="space-y-3">
        {logs.map((log) => {
          const Icon = icon[log.status];
          return (
            <div
              key={log.id}
              className="flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-black/30 p-4"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color[log.status]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white">{log.action}</p>
                  <span className="shrink-0 text-xs text-slate-500">{log.time}</span>
                </div>
                {log.detail && <p className="mt-1 text-xs text-slate-400">{log.detail}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </GlowCard>
  );
}
