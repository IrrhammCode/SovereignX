import type { TBillOracleQuote, MaturityEntry } from '@sovereignx/shared';
import { config } from '../config.js';
import {
  computeNavPerFraction,
  fetchLive3MonthYield,
  fetchUpcomingBillSchedule,
} from './treasury-feed.js';
import { getNavHistory, recordOracleSnapshot } from './oracle-history.js';

const CACHE_TTL_MS = 60 * 60 * 1000;

export class TBillOracle {
  private cache: { quote: TBillOracleQuote; expires: number } | null = null;
  private scheduleCache: { entries: MaturityEntry[]; expires: number } | null = null;

  async getQuote(): Promise<TBillOracleQuote> {
    if (this.cache && Date.now() < this.cache.expires) {
      return this.cache.quote;
    }

    const { rate, source } = await fetchLive3MonthYield(config.fred.apiKey);
    const quote: TBillOracleQuote = {
      navPerShare: computeNavPerFraction(rate),
      yieldRate: rate,
      lastUpdated: new Date().toISOString(),
      source,
    };

    recordOracleSnapshot(quote);
    this.cache = { quote, expires: Date.now() + CACHE_TTL_MS };
    return quote;
  }

  async computeDividendPerFraction(): Promise<bigint> {
    const quote = await this.getQuote();
    const quarterlyPerTen = (10 * quote.yieldRate) / 100 / 4;
    return BigInt(Math.floor(quarterlyPerTen * 1_000_000));
  }

  async getMaturitySchedule(): Promise<MaturityEntry[]> {
    if (this.scheduleCache && Date.now() < this.scheduleCache.expires) {
      return this.scheduleCache.entries;
    }

    const entries = await fetchUpcomingBillSchedule();
    this.scheduleCache = { entries, expires: Date.now() + CACHE_TTL_MS };
    return entries;
  }

  getNavHistory() {
    return getNavHistory();
  }
}

export const tBillOracle = new TBillOracle();
