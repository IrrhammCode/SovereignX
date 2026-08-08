#!/usr/bin/env node
/** Deposit CVA into DividendDistributor via API (requires pnpm dev:api). */
const API = process.env.API_URL ?? 'http://localhost:4000';
const amountUsd = Number(process.argv[2] ?? 100);

async function main() {
  console.log(`POST /api/dividends/deposit amountUsd=${amountUsd} …`);
  const res = await fetch(`${API}/api/dividends/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountUsd }),
  });
  const body = await res.json();
  console.log(JSON.stringify(body, null, 2));
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
