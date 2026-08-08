import { Router } from 'express';
import { runCCPCheck, buildIVMS101 } from '../integrations/cleanverse/ccp.js';
import { queryAPass, getEnrollmentMagiclink } from '../integrations/cleanverse/apass.js';
import { tBillOracle } from '../services/oracle.js';
import { syncCVIToChain, syncCVIBatch } from '../services/cvi-relayer.js';
import {
  generateAuditReport,
  exportAuditReportJSON,
  exportAuditReportCSV,
  logTransfer,
} from '../services/auditor.js';
import { config } from '../config.js';

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

apiRouter.get('/oracle/tbill', (_req, res) => {
  res.json(tBillOracle.getQuote());
});

apiRouter.get('/oracle/dividends', (_req, res) => {
  res.json({
    perFraction: tBillOracle.computeDividendPerFraction().toString(),
    schedule: tBillOracle.getMaturitySchedule(),
  });
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
    const ivms101 = buildIVMS101(
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
