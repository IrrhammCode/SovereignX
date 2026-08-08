import express from 'express';
import { getIndexedEvents, indexHistorical, watchTransfers } from './indexer.js';

const PORT = Number(process.env.INDEXER_PORT ?? 4001);
const app = express();

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'sovereignx-indexer' }));

app.get('/events', (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  res.json(getIndexedEvents(limit));
});

app.listen(PORT, async () => {
  console.log(`[SovereignX Indexer] listening on :${PORT}`);
  await indexHistorical();
  watchTransfers((e) => console.log('[indexer] Transfer', e.txHash));
});
