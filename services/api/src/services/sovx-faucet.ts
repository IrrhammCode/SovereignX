import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { identityRegistryAbi, MIN_FRACTION_UNITS, sovxTokenAbi } from '@sovereignx/shared';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from '../config.js';
import { ingestTransferFromTx } from './chain-events.js';

const DEMO_FRACTIONS = Number(process.env.SOVX_FAUCET_FRACTIONS ?? 2);
const CLAIM_AMOUNT = MIN_FRACTION_UNITS * BigInt(DEMO_FRACTIONS);

const monadChain = {
  id: config.monad.chainId,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [config.monad.rpcUrl] } },
} as const;

interface ClaimRecord {
  wallet: string;
  txHash: string;
  fractions: number;
  amountUsd: number;
  claimedAt: string;
}

const storePath = resolve(
  process.env.SOVX_FAUCET_CLAIMS_PATH ??
    process.env.DATABASE_PATH?.replace(/\.db$/, '-sovx-claims.json') ??
    './data/sovx-faucet-claims.json',
);

const claims = loadClaims();

function loadClaims(): ClaimRecord[] {
  try {
    if (!existsSync(storePath)) return [];
    const parsed = JSON.parse(readFileSync(storePath, 'utf8')) as ClaimRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistClaims() {
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(claims, null, 2));
}

function findClaim(wallet: string): ClaimRecord | undefined {
  const lower = wallet.toLowerCase();
  return claims.find((c) => c.wallet.toLowerCase() === lower);
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

export async function getSovxFaucetStatus(wallet: string): Promise<SovxFaucetStatus> {
  const base = {
    wallet,
    eligible: false,
    claimed: false,
    fractions: DEMO_FRACTIONS,
    amountUsd: DEMO_FRACTIONS * 10,
  };

  if (!isAddress(wallet)) {
    return { ...base, reason: 'Invalid wallet address' };
  }

  const existing = findClaim(wallet);
  if (existing) {
    return {
      ...base,
      claimed: true,
      txHash: existing.txHash,
      claimedAt: existing.claimedAt,
      eligible: true,
    };
  }

  const registry = config.contracts.identityRegistry as Hex | '';
  if (!registry) {
    return { ...base, reason: 'Identity registry not configured' };
  }

  const publicClient = createPublicClient({ chain: monadChain, transport: http(config.monad.rpcUrl) });
  const verified = await publicClient.readContract({
    address: registry,
    abi: identityRegistryAbi,
    functionName: 'isVerified',
    args: [wallet as Hex],
  });

  if (!verified) {
    return { ...base, reason: 'CVI not verified on-chain — enroll A-Pass and Sync CVI first' };
  }

  return { ...base, eligible: true };
}

export async function claimDemoSovx(wallet: string): Promise<{
  txHash?: string;
  amountUsd?: number;
  fractions?: number;
  error?: string;
  alreadyClaimed?: boolean;
}> {
  if (!isAddress(wallet)) {
    return { error: 'Invalid wallet address' };
  }

  const existing = findClaim(wallet);
  if (existing) {
    return {
      error: 'Demo SOVX already claimed for this wallet',
      alreadyClaimed: true,
      txHash: existing.txHash,
      amountUsd: existing.amountUsd,
      fractions: existing.fractions,
    };
  }

  const status = await getSovxFaucetStatus(wallet);
  if (!status.eligible) {
    return { error: status.reason ?? 'Not eligible for demo SOVX' };
  }

  const pk = config.monad.deployerPrivateKey;
  const sovx = config.contracts.sovxToken as Hex | '';
  if (!pk) return { error: 'DEPLOYER_PRIVATE_KEY not configured' };
  if (!sovx) return { error: 'SOVX_TOKEN_ADDRESS not configured' };

  const account = privateKeyToAccount(pk);
  const publicClient = createPublicClient({ chain: monadChain, transport: http(config.monad.rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: monadChain,
    transport: http(config.monad.rpcUrl),
  });

  const hash = await walletClient.writeContract({
    address: sovx,
    abi: sovxTokenAbi,
    functionName: 'mint',
    args: [wallet as Hex, CLAIM_AMOUNT],
  });

  await publicClient.waitForTransactionReceipt({ hash });

  const record: ClaimRecord = {
    wallet,
    txHash: hash,
    fractions: DEMO_FRACTIONS,
    amountUsd: DEMO_FRACTIONS * 10,
    claimedAt: new Date().toISOString(),
  };
  claims.push(record);
  persistClaims();

  ingestTransferFromTx(hash).catch(() => null);

  return {
    txHash: hash,
    amountUsd: record.amountUsd,
    fractions: record.fractions,
  };
}
