import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  stringToHex,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { identityRegistryAbi } from '@sovereignx/shared';
import { config } from '../config.js';
import { queryAPass } from '../integrations/cleanverse/apass.js';

const monadChain = {
  id: config.monad.chainId,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [config.monad.rpcUrl] } },
} as const;

function parseTier(tier: string): number {
  const n = Number.parseInt(tier.replace(/\D/g, ''), 10);
  if (Number.isNaN(n)) return 1;
  return Math.min(255, Math.max(1, n > 99 ? Math.floor(n / 10) : n));
}

function toBytes32(hash: string): Hex {
  if (hash.startsWith('0x') && hash.length === 66) return hash as Hex;
  return keccak256(stringToHex(hash));
}

function toCountryBytes2(code?: string): Hex {
  const c = (code ?? 'US').toUpperCase().padEnd(2, 'X').slice(0, 2);
  return `0x${Buffer.from(c, 'utf8').toString('hex')}` as Hex;
}

export interface SyncResult {
  wallet: string;
  synced: boolean;
  txHash?: string;
  reason?: string;
  cvi?: Awaited<ReturnType<typeof queryAPass>>;
}

export async function syncCVIToChain(wallet: string): Promise<SyncResult> {
  const registry = config.contracts.identityRegistry as Hex | '';
  const pk = config.monad.deployerPrivateKey;

  if (!registry) {
    return { wallet, synced: false, reason: 'IDENTITY_REGISTRY_ADDRESS not set — deploy first' };
  }
  if (!pk) {
    return { wallet, synced: false, reason: 'DEPLOYER_PRIVATE_KEY not set' };
  }

  const cvi = await queryAPass(wallet);
  if (!cvi) {
    return { wallet, synced: false, reason: 'No Cleanverse A-Pass — enroll via magiclink first' };
  }
  if (cvi.status !== 'Verified' || cvi.isBlacklisted) {
    return { wallet, synced: false, reason: `CVI not eligible: ${cvi.status}`, cvi };
  }

  const account = privateKeyToAccount(pk);
  const publicClient = createPublicClient({ chain: monadChain, transport: http(config.monad.rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: monadChain,
    transport: http(config.monad.rpcUrl),
  });

  const already = await publicClient.readContract({
    address: registry,
    abi: identityRegistryAbi,
    functionName: 'contains',
    args: [wallet as Hex],
  });

  if (already) {
    return { wallet, synced: true, reason: 'Already registered on-chain', cvi };
  }

  const hash = await walletClient.writeContract({
    address: registry,
    abi: identityRegistryAbi,
    functionName: 'registerIdentity',
    args: [
      wallet as Hex,
      toBytes32(cvi.kycHash),
      parseTier(cvi.tier),
      BigInt(cvi.expirationTime),
      toCountryBytes2(cvi.countryCode),
    ],
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return { wallet, synced: true, txHash: hash, cvi };
}

export async function syncCVIBatch(wallets: string[]): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (const w of wallets) {
    results.push(await syncCVIToChain(w));
  }
  return results;
}
