import { createPublicClient, http, formatUnits } from 'viem';
import { dividendDistributorAbi, identityRegistryAbi } from '@sovereignx/shared';
import { tBillOracle } from './oracle.js';
import { config } from '../config.js';
import { verifyUserCompliance } from '../integrations/cleanverse/validator.js';

const client = createPublicClient({
  transport: http(config.monad.rpcUrl),
});

async function isWalletEligible(wallet: string): Promise<boolean> {
  const registry = config.contracts.identityRegistry as `0x${string}` | undefined;
  if (!registry) return false;

  const verified = await client.readContract({
    address: registry,
    abi: identityRegistryAbi,
    functionName: 'isVerified',
    args: [wallet as `0x${string}`],
  });
  if (!verified) return false;

  const pool = config.validatorPool || config.contracts.cvaStablecoin;
  if (!pool) return verified;

  const check = await verifyUserCompliance(wallet, pool);
  return check.valid;
}

export async function getDividendStatus(wallet?: string) {
  const distributor = config.contracts.dividendDistributor as `0x${string}` | undefined;
  const [estimate, schedule] = await Promise.all([
    tBillOracle.computeDividendPerFraction(),
    tBillOracle.getMaturitySchedule(),
  ]);

  if (!distributor) {
    return {
      perFractionCva: estimate.toString(),
      perFractionUsd: formatUnits(estimate, 6),
      schedule,
      poolBalanceCva: '0',
      poolBalanceUsd: '0',
      totalDistributed: '0',
      claimedByWallet: '0',
      claimedUsd: '0',
      eligible: wallet ? await isWalletEligible(wallet) : false,
      distributor: null,
      cvaToken: config.contracts.cvaStablecoin,
    };
  }

  const [poolBalance, totalDistributed, claimed, eligible] = await Promise.all([
    client.readContract({
      address: distributor,
      abi: dividendDistributorAbi,
      functionName: 'cvaBalance',
    }),
    client.readContract({
      address: distributor,
      abi: dividendDistributorAbi,
      functionName: 'totalDistributed',
    }),
    wallet
      ? client.readContract({
          address: distributor,
          abi: dividendDistributorAbi,
          functionName: 'claimedByWallet',
          args: [wallet as `0x${string}`],
        })
      : Promise.resolve(0n),
    wallet ? isWalletEligible(wallet) : Promise.resolve(false),
  ]);

  return {
    perFractionCva: estimate.toString(),
    perFractionUsd: formatUnits(estimate, 6),
    schedule,
    poolBalanceCva: poolBalance.toString(),
    poolBalanceUsd: formatUnits(poolBalance, 6),
    totalDistributed: totalDistributed.toString(),
    claimedByWallet: claimed.toString(),
    claimedUsd: formatUnits(claimed, 6),
    eligible,
    distributor,
    cvaToken: config.contracts.cvaStablecoin,
  };
}
