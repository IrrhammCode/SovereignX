/** SovereignX shared types */

export { loadRootEnv } from './load-env.js';
export { identityRegistryAbi, sovxTokenAbi } from './abis.js';

export const SOVX_DECIMALS = 6;
export const MIN_FRACTION_USD = 10;
export const MIN_FRACTION_UNITS = 10_000_000n;

export const BRAND = {
  primaryBlue: '#002D62',
  secondaryGreen: '#00A36C',
  background: '#0A1628',
  accent: '#00FF88',
} as const;

export type CVIStatus = 'None' | 'Pending' | 'Verified' | 'Expired' | 'Sanctioned' | 'Frozen';

export interface CVIRecord {
  wallet: string;
  tier: string;
  group: string;
  status: CVIStatus;
  expirationTime: number;
  kycHash: string;
  countryCode?: string;
  isBlacklisted: boolean;
}

export interface CVAAsset {
  symbol: string;
  contractAddress: string;
  depositAddress: string;
  decimals: number;
}

export interface TBillOracleQuote {
  navPerShare: number;
  yieldRate: number;
  lastUpdated: string;
  source: 'mock' | 'live';
}

export interface IVMS101Payload {
  originator: {
    accountNumber: string;
    name: string;
    address: string;
    country: string;
    nationalId?: string;
  };
  beneficiary: {
    accountNumber: string;
    name: string;
    address: string;
    country: string;
  };
  transfer: {
    amount: string;
    currency: string;
    assetSymbol: string;
    chain: string;
  };
  compliance: {
    cviVerified: boolean;
    cvaEligible: boolean;
    travelRuleRequired: boolean;
  };
}

export interface ComplianceCheckResult {
  allowed: boolean;
  code: string;
  message: string;
  attestationHash?: string;
  senderCVI?: CVIRecord;
  receiverCVI?: CVIRecord;
}

export interface AuditReport {
  reportId: string;
  generatedAt: string;
  transfers: Array<{
    txHash: string;
    from: string;
    to: string;
    amount: string;
    ccpPassed: boolean;
    ivms101?: IVMS101Payload;
  }>;
  summary: {
    totalTransfers: number;
    blocked: number;
    cleared: number;
  };
}

export interface IndexedEvent {
  blockNumber: number;
  txHash: string;
  event: string;
  args: Record<string, unknown>;
  timestamp: number;
}
