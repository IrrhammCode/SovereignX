import { loadRootEnv } from '@sovereignx/shared/load-env';
loadRootEnv();

import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import type { IndexedEvent } from '@sovereignx/shared';

const RPC = process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz';
const SOVX = process.env.SOVX_TOKEN_ADDRESS as `0x${string}` | undefined;

const TRANSFER = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
);

const events: IndexedEvent[] = [];

export const publicClient = createPublicClient({
  transport: http(RPC),
});

export function parseTransferLog(log: Log): IndexedEvent {
  return {
    blockNumber: Number(log.blockNumber ?? 0n),
    txHash: log.transactionHash ?? '',
    event: 'Transfer',
    args: {
      from: log.topics[1],
      to: log.topics[2],
      value: log.data,
    },
    timestamp: Date.now(),
  };
}

export async function indexHistorical(fromBlock = 0n) {
  if (!SOVX) {
    console.warn('[indexer] SOVX_TOKEN_ADDRESS not set — running in stub mode');
    return;
  }

  const logs = await publicClient.getLogs({
    address: SOVX,
    event: TRANSFER,
    fromBlock,
    toBlock: 'latest',
  });

  for (const log of logs) {
    events.push(parseTransferLog(log));
  }

  console.log(`[indexer] indexed ${logs.length} Transfer events`);
}

export function getIndexedEvents(limit = 50): IndexedEvent[] {
  return events.slice(-limit).reverse();
}

export async function watchTransfers(onEvent: (e: IndexedEvent) => void) {
  if (!SOVX) return;

  publicClient.watchContractEvent({
    address: SOVX,
    abi: [TRANSFER],
    onLogs: (logs) => {
      for (const log of logs) {
        const evt = parseTransferLog(log);
        events.push(evt);
        onEvent(evt);
      }
    },
  });
}
