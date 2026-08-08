#!/usr/bin/env node
/** Sync root .env from deployments/monad.json */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');
const deployments = JSON.parse(
  readFileSync(resolve(root, 'deployments/monad.json'), 'utf8'),
);

let env = readFileSync(envPath, 'utf8');
const set = (key, val) => {
  if (!val) return;
  const re = new RegExp(`^${key}=.*$`, 'm');
  env = re.test(env) ? env.replace(re, `${key}=${val}`) : `${env.trimEnd()}\n${key}=${val}\n`;
};

set('SOVX_TOKEN_ADDRESS', deployments.sovxToken);
set('IDENTITY_REGISTRY_ADDRESS', deployments.identityRegistry);
set('COMPLIANCE_ENGINE_ADDRESS', deployments.complianceEngine);
set('DIVIDEND_DISTRIBUTOR_ADDRESS', deployments.dividendDistributor);
set('CVA_STABLECOIN_ADDRESS', deployments.cvaStablecoin);
set('NEXT_PUBLIC_SOVX_TOKEN_ADDRESS', deployments.sovxToken);
set('NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS', deployments.identityRegistry);
set('NEXT_PUBLIC_COMPLIANCE_ENGINE_ADDRESS', deployments.complianceEngine);
set('NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS', deployments.dividendDistributor);
set('NEXT_PUBLIC_CVA_STABLECOIN_ADDRESS', deployments.cvaStablecoin);
set('VALIDATOR_POOL_ADDRESS', deployments.complianceEngine);
set('INDEXER_URL', 'http://localhost:4001');
set('NEXT_PUBLIC_INDEXER_URL', 'http://localhost:4001');
set('INDEXER_LOOKBACK_BLOCKS', '5000');
if (deployments.deployBlock) {
  set('INDEXER_FROM_BLOCK', String(deployments.deployBlock));
}

writeFileSync(envPath, env);
console.log('Synced .env from deployments/monad.json');
