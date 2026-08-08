import type { CVIRecord, ComplianceCheckResult, IVMS101Payload } from '@sovereignx/shared';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function fetchCVI(address: string): Promise<CVIRecord | null> {
  const res = await fetch(`${API}/api/cvi/${address}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('CVI fetch failed');
  return res.json();
}

export async function fetchOracle() {
  const res = await fetch(`${API}/api/oracle/tbill`);
  if (!res.ok) throw new Error('Oracle fetch failed');
  return res.json();
}

export async function fetchMagiclink(): Promise<{ url?: string; error?: string }> {
  const res = await fetch(`${API}/api/enrollment/magiclink`);
  return res.json();
}

export async function syncCVI(wallet: string): Promise<{
  synced: boolean;
  txHash?: string;
  reason?: string;
}> {
  const res = await fetch(`${API}/api/cvi/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet }),
  });
  return res.json();
}

export async function preCheckTransfer(
  from: string,
  to: string,
  amountUsd: number,
): Promise<ComplianceCheckResult & { ivms101?: IVMS101Payload }> {
  const res = await fetch(`${API}/api/compliance/pre-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, amountUsd }),
  });
  const data = await res.json();
  if (!res.ok && res.status !== 422) throw new Error(data.error ?? 'Pre-check failed');
  return data;
}

export async function logTransferOnChain(entry: {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  ccpPassed: boolean;
  ivms101?: IVMS101Payload;
}) {
  await fetch(`${API}/api/compliance/log-transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
}

export async function fetchAuditReport(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${API}/api/audit/report?${params}`);
  if (!res.ok) throw new Error('Audit fetch failed');
  return res.json();
}

export function getAuditDownloadUrl(format: 'json' | 'csv' = 'json') {
  return `${API}/api/audit/report?format=${format === 'csv' ? 'csv' : 'download'}`;
}

export async function fetchTravelRule(address: string) {
  const res = await fetch(`${API}/api/compliance/travel-rule/${address}`);
  return res.json();
}
