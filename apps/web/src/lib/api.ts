import type { CVIRecord, ComplianceCheckResult, IVMS101Payload } from '@sovereignx/shared';

/** Same-origin on Vercel when NEXT_PUBLIC_API_URL is unset (free single deploy) */
function apiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (configured) return configured;
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:4000';
}

const API = apiBase();

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

export async function fetchOracleHistory() {
  const res = await fetch(`${API}/api/oracle/history`);
  if (!res.ok) throw new Error('Oracle history fetch failed');
  return res.json() as Promise<Array<{ date: string; nav: number; yieldRate: number }>>;
}

export async function fetchProtocolStats() {
  const res = await fetch(`${API}/api/protocol/stats`);
  if (!res.ok) throw new Error('Protocol stats fetch failed');
  return res.json() as Promise<import('@sovereignx/shared').ProtocolStats>;
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

export async function fetchTravelRule(address: string, txHash: string) {
  const res = await fetch(`${API}/api/compliance/travel-rule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, txHash }),
  });
  return res.json();
}

export async function fetchIndexerEvents(limit = 50) {
  const res = await fetch(`${API}/api/indexer/events?limit=${limit}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Indexer fetch failed');
  return data as import('@sovereignx/shared').IndexedEvent[];
}

export async function fetchDividendStatus(wallet?: string) {
  const params = wallet ? `?wallet=${wallet}` : '';
  const res = await fetch(`${API}/api/dividends/status${params}`);
  if (!res.ok) throw new Error('Dividend fetch failed');
  return res.json();
}

export async function fetchValidatorStatus() {
  const res = await fetch(`${API}/api/validator/status`);
  return res.json();
}

export interface SovxFaucetStatus {
  wallet: string;
  eligible: boolean;
  claimed: boolean;
  fractions: number;
  amountUsd: number;
  reason?: string;
  txHash?: string;
  claimedAt?: string;
}

export async function fetchSovxFaucetStatus(wallet: string): Promise<SovxFaucetStatus> {
  const res = await fetch(`${API}/api/faucet/sovx/status?wallet=${encodeURIComponent(wallet)}`);
  if (!res.ok) throw new Error('SOVX faucet status fetch failed');
  return res.json();
}

export async function claimDemoSovx(wallet: string): Promise<{
  txHash?: string;
  amountUsd?: number;
  fractions?: number;
  error?: string;
  alreadyClaimed?: boolean;
}> {
  const res = await fetch(`${API}/api/faucet/sovx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet }),
  });
  return res.json();
}
