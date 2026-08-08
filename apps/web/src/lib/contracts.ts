'use client';

import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { sovxTokenAbi } from '@sovereignx/shared';

const SOVX = process.env.NEXT_PUBLIC_SOVX_TOKEN_ADDRESS as `0x${string}` | undefined;

export function useSOVXBalance(address?: `0x${string}`) {
  return useReadContract({
    address: SOVX,
    abi: sovxTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!SOVX && !!address },
  });
}

export function formatSOVX(raw?: bigint) {
  if (raw == null) return '—';
  return `${formatUnits(raw, 6)} SOVX`;
}

export { SOVX };
