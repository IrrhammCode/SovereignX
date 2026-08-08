# SovereignX Demo Guide

## Live Deployment (Monad Testnet)

| Contract | Address |
|----------|---------|
| SOVX Token | `0x03f6E30518347135049be7ABc901f727489E79A0` |
| IdentityRegistry | `0x935AbfE82F9Abcc99a25f8252230d991887eB36d` |
| ComplianceEngine | `0x622fBD1835B855334A2033ebF61Ad56f3d095286` |
| DividendDistributor | `0x62059f45007d65Ff127128b8Bb2f77d93aAfca11` |

Explorer: https://testnet.monadscan.com

## Quick Start

```bash
pnpm dev:api   # :4000
pnpm dev:web   # :3000
```

- **Landing:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard

## Wallet Setup

1. Install **MetaMask** (or any injected EVM wallet)
2. Add **Monad Testnet**:
   - Chain ID: `10143`
   - RPC: `https://testnet-rpc.monad.xyz`
   - Symbol: `MON`
3. Click **Connect Wallet** on landing or dashboard
4. If wrong network, use **Switch to Monad** banner

## Demo Script (5 min)

1. **Connect wallet** — deployer or enrolled wallet on Monad testnet
2. **Enroll CVI** — open A-Pass magiclink from Enrollment panel
3. **Sync CVI** — click "Sync CVI On-Chain" (or `POST /api/cvi/sync`)
4. **Show balance** — deployer holds 100 × $10 SOVX fractions ($1,000)
5. **Register recipient** — enroll + sync second wallet
6. **CCP Pre-Check** — transfer $10+ between verified wallets
7. **Execute Transfer** — on-chain SOVX transfer on Monad
8. **Show revert** — attempt transfer to unverified wallet → REVERT

## Validator Pool (Cleanverse)

Check status: `GET /api/validator/status`  
Register pool: `POST /api/validator/register` (requires EIP-191 signature from on-chain `owner()`)

**Note:** SovereignX `ComplianceEngine` uses AccessControl (no `owner()`). Automatic registration may return `Invalid contract owner signature` — use Cleanverse dashboard or redeploy with Ownable wrapper for production.

```bash
pnpm sync:env          # sync .env from deployments/monad.json
pnpm register:validator # register via API (needs dev:api running)
pnpm dev:indexer       # blockchain event indexer on :4001
pnpm faucet:cva 0xYourWallet 100  # request test CVA from Cleanverse
pnpm deposit:dividends # seed CVA dividend pool (needs deployer CVA balance)
```

## API Endpoints

- `GET /api/enrollment/magiclink` — A-Pass enrollment URL
- `POST /api/cvi/sync` — `{ "wallet": "0x..." }`
- `POST /api/compliance/pre-check` — CCP + IVMS 101
- `GET /api/audit/report?format=download` — compliance audit export

## Security Guarantee

> Toxic liquidity is mathematically impossible.

Every transfer passes `onlyVerifiedSender`, `onlyVerifiedReceiver`, and `ComplianceEngine.canTransfer()`. Failed checks revert atomically — no forced transfer override.
