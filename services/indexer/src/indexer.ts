import { loadRootEnv } from '@sovereignx/shared/load-env';
loadRootEnv();

import { createPublicClient, http, decodeEventLog, parseAbiItem, type Log } from 'viem';
import type { IndexedEvent } from '@sovereignx/shared';
import { formatUnits } from 'viem';

const RPC = process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz';
const SOVX = process.env.SOVX_TOKEN_ADDRESS as `0x${string}` | undefined;
const FROM_BLOCK = process.env.INDEXER_FROM_BLOCK
  ? BigInt(process.env.INDEXER_FROM_BLOCK)
  : undefined;
const LOOKBACK_BLOCKS = BigInt(process.env.INDEXER_LOOKBACK_BLOCKS ?? '5000');

const TRANSFER = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
);

const events: IndexedEvent[] = [];
const blockTimestamps = new Map<number, number>();

export const publicClient = createPublicClient({
  transport: http(RPC),
});

async function blockTimestamp(blockNumber: number): Promise<number> {
  const cached = blockTimestamps.get(blockNumber);
  if (cached != null) return cached;

  const block = await publicClient.getBlock({ blockNumber: BigInt(blockNumber) });
  const ts = Number(block.timestamp) * 1000;
  blockTimestamps.set(blockNumber, ts);
  return ts;
}

export async function parseTransferLog(log: Log): Promise<IndexedEvent> {
  const decoded = decodeEventLog({
    abi: [TRANSFER],
    data: log.data,
    topics: log.topics,
  });

  const args = decoded.args as { from: string; to: string; value: bigint };
  const blockNumber = Number(log.blockNumber ?? 0n);

  return {
    blockNumber,
    txHash: log.transactionHash ?? '',
    event: 'Transfer',
    args: {
      from: args.from,
      to: args.to,
      value: args.value.toString(),
      amountUsd: formatUnits(args.value, 6),
    },
    timestamp: await blockTimestamp(blockNumber),
  };
}

export async function indexHistorical(fromBlock?: bigint) {
  if (!SOVX) {
    console.warn('[indexer] SOVX_TOKEN_ADDRESS not set — skipping indexing');
    return;
  }

  const latest = await publicClient.getBlockNumber();
  const start = fromBlock ?? FROM_BLOCK ?? (latest > LOOKBACK_BLOCKS ? latest - LOOKBACK_BLOCKS : 0n);
  const chunk = 100n;

  let total = 0;
  for (let block = start; block <= latest; block += chunk) {
    const toBlock = block + chunk - 1n > latest ? latest : block + chunk - 1n;
    const logs = await publicClient.getLogs({
      address: SOVX,
      event: TRANSFER,
      fromBlock: block,
      toBlock: toBlock,
    });
    for (const log of logs) {
      events.push(await parseTransferLog(log));
    }
    total += logs.length;
  }

  console.log(`[indexer] indexed ${total} Transfer events (blocks ${start}-${latest})`);
}

export async function ingestFromTxHash(txHash: `0x${string}`): Promise<IndexedEvent[]> {
  if (!SOVX) return [];

  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  const ingested: IndexedEvent[] = [];

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== SOVX.toLowerCase()) continue;
    try {
      const evt = await parseTransferLog(log);
      events.push(evt);
      ingested.push(evt);
    } catch {
      // skip non-transfer logs
    }
  }

  return ingested;
}

export function getIndexedEvents(limit = 50): IndexedEvent[] {
  return events.slice(-limit).reverse();
}

export async function watchTransfers(onEvent: (e: IndexedEvent) => void) {
  if (!SOVX) return;

  publicClient.watchContractEvent({
    address: SOVX,
    abi: [TRANSFER],
    onLogs: async (logs) => {
      for (const log of logs) {
        const evt = await parseTransferLog(log);
        events.push(evt);
        onEvent(evt);
      }
    },
  });
}
