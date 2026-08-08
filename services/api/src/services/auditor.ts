import type { AuditReport } from '@sovereignx/shared';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

interface TransferLog {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  ccpPassed: boolean;
  ivms101?: AuditReport['transfers'][0]['ivms101'];
  timestamp: string;
}

const storePath = resolve(
  process.env.AUDIT_LOG_PATH ??
    process.env.DATABASE_PATH?.replace(/\.db$/, '-audit.json') ??
    './data/audit-logs.json',
);

const transferLogs: TransferLog[] = loadLogs();

function loadLogs(): TransferLog[] {
  try {
    if (!existsSync(storePath)) return [];
    const raw = readFileSync(storePath, 'utf8');
    const parsed = JSON.parse(raw) as TransferLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistLogs() {
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(transferLogs, null, 2));
}

export function logTransfer(entry: Omit<TransferLog, 'timestamp'>) {
  transferLogs.push({ ...entry, timestamp: new Date().toISOString() });
  persistLogs();
}

export function generateAuditReport(from?: string, to?: string): AuditReport {
  let filtered = [...transferLogs];
  if (from) filtered = filtered.filter((t) => t.from.toLowerCase() === from.toLowerCase());
  if (to) filtered = filtered.filter((t) => t.to.toLowerCase() === to.toLowerCase());

  const blocked = filtered.filter((t) => !t.ccpPassed).length;
  const cleared = filtered.filter((t) => t.ccpPassed).length;

  return {
    reportId: randomUUID(),
    generatedAt: new Date().toISOString(),
    transfers: filtered.map(({ timestamp: _, ...rest }) => rest),
    summary: {
      totalTransfers: filtered.length,
      blocked,
      cleared,
    },
  };
}

export function exportAuditReportJSON(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

export function exportAuditReportCSV(report: AuditReport): string {
  const header = 'txHash,from,to,amount,ccpPassed';
  const rows = report.transfers.map(
    (t) => `${t.txHash},${t.from},${t.to},${t.amount},${t.ccpPassed}`,
  );
  return [header, ...rows].join('\n');
}
