import { createPublicClient, http, formatUnits } from 'viem';
import { sovxTokenAbi, MIN_FRACTION_USD } from '@sovereignx/shared';
import type { ProtocolStats } from '@sovereignx/shared';
import { config } from '../config.js';
import { tBillOracle } from './oracle.js';

const client = createPublicClient({
  transport: http(config.monad.rpcUrl),
});

export async function getProtocolStats(): Promise<ProtocolStats> {
  const quote = await tBillOracle.getQuote();

  let totalSupply = 0n;
  const sovx = config.contracts.sovxToken as `0x${string}` | undefined;
  if (sovx) {
    totalSupply = await client.readContract({
      address: sovx,
      abi: sovxTokenAbi,
      functionName: 'totalSupply',
    });
  }

  return {
    yieldRate: quote.yieldRate,
    navPerShare: quote.navPerShare,
    totalSupply: totalSupply.toString(),
    totalSupplyFormatted: `${formatUnits(totalSupply, 6)} SOVX`,
    minFractionUsd: MIN_FRACTION_USD,
    chainId: config.monad.chainId,
    chainName: 'Monad Testnet',
    oracleSource: quote.source,
    lastUpdated: quote.lastUpdated,
  };
}
