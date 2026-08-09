#!/usr/bin/env node
/** Claim demo SOVX (verified wallets only) via API faucet. */
const API = process.env.API_URL ?? 'http://localhost:4000';
const wallet = process.argv[2];

if (!wallet) {
  console.error('Usage: pnpm faucet:sovx <walletAddress>');
  process.exit(1);
}

async function main() {
  const statusRes = await fetch(`${API}/api/faucet/sovx/status?wallet=${encodeURIComponent(wallet)}`);
  const status = await statusRes.json();
  console.log('Status:', JSON.stringify(status, null, 2));

  if (!status.eligible || status.claimed) {
    process.exit(status.claimed ? 0 : 1);
  }

  console.log(`POST /api/faucet/sovx wallet=${wallet} …`);
  const res = await fetch(`${API}/api/faucet/sovx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet }),
  });
  const body = await res.json();
  console.log(JSON.stringify(body, null, 2));
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
