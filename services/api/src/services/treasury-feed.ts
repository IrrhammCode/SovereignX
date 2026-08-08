/** Live US Treasury data — Treasury.gov CSV + bill-rate XML. No mock fallbacks. */

export interface TreasuryBill {
  cusip: string;
  date: string;
  yield: number;
}

const YIELD_CSV = (year: number) =>
  `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${year}&page&_format=csv`;

const BILL_RATES_XML = (year: number, month: number) =>
  `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_bill_rates&field_tdr_date_value_month=${year}${String(month).padStart(2, '0')}`;

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export async function fetchTreasury3MonthYieldFromCsv(): Promise<number> {
  const year = new Date().getUTCFullYear();
  const res = await fetch(YIELD_CSV(year), { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`Treasury yield CSV HTTP ${res.status}`);

  const lines = (await res.text()).trim().split('\n');
  if (lines.length < 2) throw new Error('Treasury yield CSV empty');

  const header = parseCsvLine(lines[0]);
  const col3Mo = header.findIndex((h) => h.replace(/"/g, '') === '3 Mo');
  if (col3Mo < 0) throw new Error('3 Mo column not found in Treasury CSV');

  const latest = parseCsvLine(lines[1]);
  const rate = Number(latest[col3Mo]?.replace(/"/g, ''));
  if (!Number.isFinite(rate)) throw new Error('Invalid 3 Mo yield in Treasury CSV');
  return rate;
}

export async function fetchFred3MonthYield(apiKey: string): Promise<number> {
  const url = new URL('https://api.stlouisfed.org/fred/series/observations');
  url.searchParams.set('series_id', 'DGS3MO');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('sort_order', 'desc');
  url.searchParams.set('limit', '1');

  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`FRED HTTP ${res.status}`);

  const body = (await res.json()) as { observations?: Array<{ value: string }> };
  const raw = body.observations?.[0]?.value;
  if (!raw || raw === '.') throw new Error('FRED returned no DGS3MO observation');
  const rate = Number(raw);
  if (!Number.isFinite(rate)) throw new Error('Invalid FRED DGS3MO value');
  return rate;
}

export async function fetchLive3MonthYield(
  fredApiKey?: string,
): Promise<{ rate: number; source: 'fred' | 'treasury' }> {
  if (fredApiKey) {
    try {
      return { rate: await fetchFred3MonthYield(fredApiKey), source: 'fred' };
    } catch (err) {
      console.warn('[oracle] FRED fetch failed, falling back to Treasury.gov CSV:', err);
    }
  }
  return { rate: await fetchTreasury3MonthYieldFromCsv(), source: 'treasury' };
}

function parseBillRateEntries(xml: string): TreasuryBill[] {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
  const bills: TreasuryBill[] = [];

  for (const [, body] of entries) {
    const cusip = body.match(/<d:CUSIP_13WK>([^<]+)<\/d:CUSIP_13WK>/)?.[1];
    const maturity = body.match(/<d:MATURITY_DATE_13WK[^>]*>([^<]+)<\/d:MATURITY_DATE_13WK>/)?.[1];
    const yieldStr = body.match(/<d:ROUND_B1_YIELD_13WK_2[^>]*>([\d.]+)<\/d:ROUND_B1_YIELD_13WK_2>/)?.[1];
    if (!cusip || !maturity || !yieldStr) continue;

    bills.push({
      cusip,
      date: maturity.slice(0, 10),
      yield: Number(Number(yieldStr).toFixed(2)),
    });
  }

  return bills;
}

export async function fetchUpcomingBillSchedule(limit = 6): Promise<TreasuryBill[]> {
  const now = new Date();
  const seen = new Map<string, TreasuryBill>();

  for (let offset = 0; offset < 6; offset++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;

    const res = await fetch(BILL_RATES_XML(year, month), { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) continue;

    for (const bill of parseBillRateEntries(await res.text())) {
      if (new Date(bill.date).getTime() >= now.getTime() && !seen.has(bill.cusip)) {
        seen.set(bill.cusip, bill);
      }
    }
  }

  return [...seen.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

/** Accrued NAV for a $10 SOVX fraction from live annualized yield. */
export function computeNavPerFraction(yieldRate: number, at = new Date()): number {
  const year = at.getUTCFullYear();
  const quarter = Math.floor(at.getUTCMonth() / 3);
  const quarterStart = new Date(Date.UTC(year, quarter * 3, 1));
  const daysInQuarter = (at.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24);
  const accrued = 10 * (yieldRate / 100) * (daysInQuarter / 365);
  return Number((10 + accrued).toFixed(4));
}
