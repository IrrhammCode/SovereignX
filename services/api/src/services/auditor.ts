import type { AuditReport } from '@sovereignx/shared';
import { randomUUID } from 'node:crypto';

interface TransferLog {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  ccpPassed: boolean;
  ivms101?: AuditReport['transfers'][0]['ivms101'];
  timestamp: string;
}

const transferLogs: TransferLog[] = [];

export function logTransfer(entry: Omit<TransferLog, 'timestamp'>) {
  transferLogs.push({ ...entry, timestamp: new Date().toISOString() });
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
