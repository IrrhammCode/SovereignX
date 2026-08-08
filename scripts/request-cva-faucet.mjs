#!/usr/bin/env node
/** Request test CVA (ausdc) from Cleanverse institution faucet via API. */
const API = process.env.API_URL ?? 'http://localhost:4000';
const address = process.argv[2];
const amount = String(process.argv[3] ?? 100);

if (!address) {
  console.error('Usage: pnpm faucet:cva <depositAddress> [amount]');
  process.exit(1);
}

async function main() {
  console.log(`POST /api/faucet/cva depositAddress=${address} amount=${amount} …`);
  const res = await fetch(`${API}/api/faucet/cva`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ depositAddress: address, amount }),
  });
  const body = await res.json();
  console.log(JSON.stringify(body, null, 2));
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
