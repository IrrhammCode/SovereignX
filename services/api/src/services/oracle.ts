import type { TBillOracleQuote } from '@sovereignx/shared';

/** Mock RWA Oracle — feeds T-Bill NAV, yield, and dividend schedule */
export class TBillOracle {
  private baseNav = 99.875;
  private baseYield = 5.28;

  getQuote(): TBillOracleQuote {
    const jitter = (Math.sin(Date.now() / 86400000) * 0.01);
    return {
      navPerShare: Number((this.baseNav + jitter).toFixed(4)),
      yieldRate: this.baseYield,
      lastUpdated: new Date().toISOString(),
      source: 'mock',
    };
  }

  /** Dividend per $10 fraction (6-decimal units) in CVA micro-units */
  computeDividendPerFraction(): bigint {
    const quote = this.getQuote();
    const annualYield = quote.yieldRate / 100;
    const quarterlyPerTen = 10 * annualYield / 4;
    return BigInt(Math.floor(quarterlyPerTen * 1_000_000));
  }

  getMaturitySchedule(): Array<{ date: string; cusip: string; yield: number }> {
    return [
      { date: '2026-11-15', cusip: '912797MF4', yield: 5.31 },
      { date: '2027-02-15', cusip: '912797MG2', yield: 5.25 },
      { date: '2027-05-15', cusip: '912797MH0', yield: 5.22 },
    ];
  }
}

export const tBillOracle = new TBillOracle();
