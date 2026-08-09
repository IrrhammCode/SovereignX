import {
  createPublicClient,
  decodeEventLog,
  formatUnits,
  http,
  parseAbiItem,
  type Log,
} from 'viem';
import type { IndexedEvent } from '@sovereignx/shared';
import { config } from '../config.js';

const TRANSFER = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
);

const client = createPublicClient({
  transport: http(config.monad.rpcUrl),
});

const blockTimestamps = new Map<number, number>();
let cachedEvents: IndexedEvent[] | null = null;
let cacheAt = 0;
const CACHE_MS = 60_000;

async function blockTimestamp(blockNumber: number): Promise<number> {
  const cached = blockTimestamps.get(blockNumber);
  if (cached != null) return cached;
  const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
  const ts = Number(block.timestamp) * 1000;
  blockTimestamps.set(blockNumber, ts);
  return ts;
}

async function parseTransferLog(log: Log): Promise<IndexedEvent> {
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

/** Fetch SOVX Transfer logs directly from Monad RPC (no separate indexer service). */
export async function fetchChainTransferEvents(limit = 50): Promise<IndexedEvent[]> {
  const sovx = config.contracts.sovxToken as `0x${string}` | '';
  if (!sovx) return [];

  const now = Date.now();
  if (cachedEvents && now - cacheAt < CACHE_MS) {
    return cachedEvents.slice(0, limit);
  }

  const fromBlock = BigInt(process.env.INDEXER_FROM_BLOCK ?? '51873800');
  const latest = await client.getBlockNumber();
  const chunk = 2000n;
  const events: IndexedEvent[] = [];

  for (let start = fromBlock; start <= latest; start += chunk) {
    const end = start + chunk - 1n > latest ? latest : start + chunk - 1n;
    const logs = await client.getLogs({
      address: sovx,
      event: TRANSFER,
      fromBlock: start,
      toBlock: end,
    });
    for (const log of logs) {
      events.push(await parseTransferLog(log));
    }
  }

  events.sort((a, b) => b.blockNumber - a.blockNumber);
  cachedEvents = events;
  cacheAt = now;
  return events.slice(0, limit);
}

export async function ingestTransferFromTx(txHash: `0x${string}`): Promise<IndexedEvent[]> {
  const sovx = config.contracts.sovxToken as `0x${string}` | '';
  if (!sovx) return [];

  const receipt = await client.getTransactionReceipt({ hash: txHash });
  const ingested: IndexedEvent[] = [];

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== sovx.toLowerCase()) continue;
    try {
      ingested.push(await parseTransferLog(log));
    } catch {
      // skip non-transfer logs
    }
  }

  if (ingested.length && cachedEvents) {
    cachedEvents = [...ingested, ...cachedEvents];
    cacheAt = Date.now();
  }

  return ingested;
}
