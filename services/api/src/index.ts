import { loadRootEnv } from '@sovereignx/shared/load-env';
loadRootEnv();

import { config } from './config.js';
import { createApiApp } from './app.js';

const app = createApiApp();

app.listen(config.port, () => {
  console.log(`[SovereignX API] listening on :${config.port}`);
  console.log(`[SovereignX API] registry=${config.contracts.identityRegistry || '(not deployed)'}`);
});
