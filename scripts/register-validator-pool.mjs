#!/usr/bin/env node
/** Register validator pool via local API (requires pnpm dev:api). */
const API = process.env.API_URL ?? 'http://localhost:4000';

async function main() {
  console.log('POST /api/validator/register …');
  const res = await fetch(`${API}/api/validator/register`, { method: 'POST' });
  const body = await res.json();
  console.log(JSON.stringify(body, null, 2));
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
