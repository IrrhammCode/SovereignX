import { loadRootEnv } from '@sovereignx/shared/load-env';
loadRootEnv();

import express from 'express';
import { getIndexedEvents, indexHistorical, ingestFromTxHash, watchTransfers } from './indexer.js';

const PORT = Number(process.env.INDEXER_PORT ?? 4001);
const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'sovereignx-indexer' }));

app.get('/events', (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  res.json(getIndexedEvents(limit));
});

app.post('/ingest', async (req, res) => {
  const txHash = req.body?.txHash as `0x${string}` | undefined;
  if (!txHash?.startsWith('0x')) {
    return res.status(400).json({ error: 'txHash required' });
  }
  try {
    const events = await ingestFromTxHash(txHash);
    res.json({ ingested: events.length, events });
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'ingest failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[SovereignX Indexer] listening on :${PORT}`);
  indexHistorical()
    .then(() => watchTransfers((e) => console.log('[indexer] Transfer', e.txHash)))
    .catch((err) => console.error('[indexer] historical scan failed', err));
});
