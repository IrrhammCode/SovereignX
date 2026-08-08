import { Router } from 'express';
import { runCCPCheck, buildIVMS101 } from '../integrations/cleanverse/ccp.js';
import { queryAPass, getEnrollmentMagiclink, downloadTravelRule } from '../integrations/cleanverse/apass.js';
import { tBillOracle } from '../services/oracle.js';
import { syncCVIToChain, syncCVIBatch } from '../services/cvi-relayer.js';
import {
  generateAuditReport,
  exportAuditReportJSON,
  exportAuditReportCSV,
  logTransfer,
} from '../services/auditor.js';
import {
  isPoolRegistered,
  verifyUserCompliance,
  registerCompliancePool,
  queryPoolRules,
} from '../integrations/cleanverse/validator.js';
import { config } from '../config.js';
import { getDividendStatus } from '../services/dividends.js';
import { getProtocolStats } from '../services/protocol.js';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'sovereignx-api',
    contracts: config.contracts,
  });
});

apiRouter.get('/enrollment/magiclink', async (_req, res) => {
  const result = await getEnrollmentMagiclink();
  if (result.url) return res.json(result);
  res.status(502).json(result);
});

apiRouter.post('/cvi/sync', async (req, res) => {
  const { wallet, wallets } = req.body as { wallet?: string; wallets?: string[] };
  if (wallets?.length) {
    return res.json({ results: await syncCVIBatch(wallets) });
  }
  if (wallet) {
    return res.json(await syncCVIToChain(wallet));
  }
  res.status(400).json({ error: 'wallet or wallets required' });
});

apiRouter.get('/oracle/tbill', async (_req, res) => {
  try {
    res.json(await tBillOracle.getQuote());
  } catch (e) {
    res.status(503).json({
      error: 'Oracle unavailable',
      detail: e instanceof Error ? e.message : 'unknown',
    });
  }
});

apiRouter.get('/oracle/history', (_req, res) => {
  res.json(tBillOracle.getNavHistory());
});

apiRouter.get('/oracle/dividends', async (_req, res) => {
  try {
    res.json({
      perFraction: (await tBillOracle.computeDividendPerFraction()).toString(),
      schedule: await tBillOracle.getMaturitySchedule(),
    });
  } catch (e) {
    res.status(503).json({
      error: 'Dividend oracle unavailable',
      detail: e instanceof Error ? e.message : 'unknown',
    });
  }
});

apiRouter.get('/protocol/stats', async (_req, res) => {
  try {
    res.json(await getProtocolStats());
  } catch (e) {
    res.status(503).json({
      error: 'Protocol stats unavailable',
      detail: e instanceof Error ? e.message : 'unknown',
    });
  }
});

apiRouter.get('/cvi/:address', async (req, res) => {
  const cvi = await queryAPass(req.params.address);
  if (!cvi) return res.status(404).json({ error: 'No CVI record' });
  res.json(cvi);
});

apiRouter.post('/compliance/pre-check', async (req, res) => {
  const { from, to, amountUsd } = req.body as {
    from: string;
    to: string;
    amountUsd: number;
  };

  if (!from || !to || amountUsd == null) {
    return res.status(400).json({ error: 'from, to, amountUsd required' });
  }

  const result = await runCCPCheck(from, to, amountUsd);

  if (result.allowed && result.senderCVI && result.receiverCVI) {
    const ivms101 = await buildIVMS101(
      from,
      to,
      String(amountUsd),
      result.senderCVI,
      result.receiverCVI,
    );
    return res.json({ ...result, ivms101 });
  }

  res.status(422).json(result);
});

apiRouter.get('/compliance/travel-rule/:address', async (req, res) => {
  const result = await downloadTravelRule(req.params.address);
  if (result.url) return res.json(result);
  res.status(502).json(result);
});

apiRouter.post('/compliance/log-transfer', (req, res) => {
  const { txHash, from, to, amount, ccpPassed, ivms101 } = req.body;
  logTransfer({ txHash, from, to, amount, ccpPassed, ivms101 });
  res.json({ logged: true });
});

apiRouter.get('/audit/report', (req, res) => {
  const { from, to, format } = req.query;
  const report = generateAuditReport(
    from as string | undefined,
    to as string | undefined,
  );

  if (format === 'csv') {
    res.type('text/csv').send(exportAuditReportCSV(report));
    return;
  }

  if (format === 'download') {
    res.type('application/json').attachment(`sovereignx-audit-${report.reportId}.json`);
    res.send(exportAuditReportJSON(report));
    return;
  }

  res.json(report);
});

apiRouter.get('/indexer/events', async (req, res) => {
  const limit = req.query.limit ?? '50';
  try {
    const r = await fetch(`${config.indexerUrl}/events?limit=${limit}`);
    if (!r.ok) throw new Error(`Indexer HTTP ${r.status}`);
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({
      error: 'Indexer offline — run pnpm dev:indexer',
      detail: e instanceof Error ? e.message : 'unknown',
    });
  }
});

apiRouter.get('/dividends/status', async (req, res) => {
  const wallet = req.query.wallet as string | undefined;
  res.json(await getDividendStatus(wallet));
});

apiRouter.get('/validator/status', async (_req, res) => {
  const pool = config.validatorPool;
  if (!pool) return res.status(400).json({ error: 'VALIDATOR_POOL_ADDRESS not configured' });
  const status = await isPoolRegistered(pool);
  let rules = null;
  if (status.registered) {
    const r = await queryPoolRules(pool);
    rules = r.data?.rules ?? null;
  }
  res.json({ pool, ...status, rules });
});

apiRouter.post('/validator/register', async (_req, res) => {
  const pool = config.validatorPool;
  const pk = config.monad.deployerPrivateKey;
  if (!pool || !pk) {
    return res.status(400).json({ error: 'Pool address or deployer key not configured' });
  }

  const existing = await isPoolRegistered(pool);
  if (existing.registered) {
    return res.json({ alreadyRegistered: true, pool });
  }

  const account = privateKeyToAccount(pk);
  const message = `${config.cleanverse.chain}${pool}`;
  const walletClient = createWalletClient({
    account,
    transport: http(config.monad.rpcUrl),
  });
  const ownerSignature = await walletClient.signMessage({ message });

  const result = await registerCompliancePool(pool, ownerSignature);
  if (result.code === '0000') {
    return res.json({ registered: true, pool, txHash: result.data?.tx_hash });
  }
  res.status(502).json({ code: result.code, message: result.message });
});
