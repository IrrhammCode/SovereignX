#!/usr/bin/env node
/**
 * Update .env and deployments/monad.json from forge script console output or manual args.
 * Usage: node scripts/save-deployments.mjs --registry 0x... --compliance 0x... --sovx 0x... --dividend 0x...
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');

function parseArgs() {
  const out = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const val = args[i + 1];
    if (key && val) out[key] = val;
  }
  return out;
}

const a = parseArgs();
const deployments = {
  chain: 'monad-testnet',
  chainId: 10143,
  timestamp: new Date().toISOString(),
  identityRegistry: a.registry ?? '',
  complianceEngine: a.compliance ?? '',
  sovxToken: a.sovx ?? '',
  dividendDistributor: a.dividend ?? '',
  cvaStablecoin: a.cva ?? '0xaC0893567D43C3E7e6e35a72803df05416C1f20D',
  deployBlock: a.deployBlock ? Number(a.deployBlock) : undefined,
  explorer: 'https://testnet.monadscan.com',
};

mkdirSync(resolve(root, 'deployments'), { recursive: true });
writeFileSync(resolve(root, 'deployments/monad.json'), JSON.stringify(deployments, null, 2));

let env = readFileSync(envPath, 'utf8');
const set = (key, val) => {
  if (!val) return;
  const re = new RegExp(`^${key}=.*$`, 'm');
  env = re.test(env) ? env.replace(re, `${key}=${val}`) : `${env.trimEnd()}\n${key}=${val}\n`;
};

set('IDENTITY_REGISTRY_ADDRESS', deployments.identityRegistry);
set('COMPLIANCE_ENGINE_ADDRESS', deployments.complianceEngine);
set('SOVX_TOKEN_ADDRESS', deployments.sovxToken);
set('DIVIDEND_DISTRIBUTOR_ADDRESS', deployments.dividendDistributor);
set('CVA_STABLECOIN_ADDRESS', deployments.cvaStablecoin);
set('NEXT_PUBLIC_SOVX_TOKEN_ADDRESS', deployments.sovxToken);
set('NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS', deployments.identityRegistry);
set('NEXT_PUBLIC_COMPLIANCE_ENGINE_ADDRESS', deployments.complianceEngine);
set('NEXT_PUBLIC_DIVIDEND_DISTRIBUTOR_ADDRESS', deployments.dividendDistributor);

const webDeploymentsPath = resolve(root, 'apps/web/public/deployments.json');
writeFileSync(webDeploymentsPath, JSON.stringify(deployments, null, 2));

writeFileSync(envPath, env);
console.log('Saved deployments/monad.json, apps/web/public/deployments.json, and updated .env');
