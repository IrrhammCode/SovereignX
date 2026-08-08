import { createPublicClient, http, formatUnits } from 'viem';
import { dividendDistributorAbi } from '@sovereignx/shared';
import { tBillOracle } from './oracle.js';
import { config } from '../config.js';

const client = createPublicClient({
  transport: http(config.monad.rpcUrl),
});

export async function getDividendStatus(wallet?: string) {
  const distributor = config.contracts.dividendDistributor as `0x${string}` | undefined;
  const estimate = tBillOracle.computeDividendPerFraction();
  const schedule = tBillOracle.getMaturitySchedule();

  if (!distributor) {
    return {
      perFractionCva: estimate.toString(),
      perFractionUsd: formatUnits(estimate, 6),
      schedule,
      poolBalanceCva: '0',
      totalDistributed: '0',
      claimedByWallet: '0',
      eligible: false,
    };
  }

  const [poolBalance, totalDistributed, claimed] = await Promise.all([
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
    eligible: !!wallet,
    distributor,
    cvaToken: config.contracts.cvaStablecoin,
  };
}
