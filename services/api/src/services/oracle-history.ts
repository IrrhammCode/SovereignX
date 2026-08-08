import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { TBillOracleQuote } from '@sovereignx/shared';

export interface NavSnapshot {
  date: string;
  nav: number;
  yieldRate: number;
}

const storePath = resolve(process.env.ORACLE_HISTORY_PATH ?? './data/oracle-history.json');
const MAX_SNAPSHOTS = 180;

function load(): NavSnapshot[] {
  try {
    if (!existsSync(storePath)) return [];
    const parsed = JSON.parse(readFileSync(storePath, 'utf8')) as NavSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(snapshots: NavSnapshot[]) {
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(snapshots, null, 2));
}

export function recordOracleSnapshot(quote: TBillOracleQuote) {
  const day = quote.lastUpdated.slice(0, 10);
  const snapshots = load().filter((s) => s.date !== day);
  snapshots.push({ date: day, nav: quote.navPerShare, yieldRate: quote.yieldRate });
  snapshots.sort((a, b) => a.date.localeCompare(b.date));
  persist(snapshots.slice(-MAX_SNAPSHOTS));
}

export function getNavHistory(): NavSnapshot[] {
  return load();
}
