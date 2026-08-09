# SovereignX (SOVX)

**Fractionalized US Treasury Bills on Monad — ERC-3643 compliant, Cleanverse-powered.**

> Toxic liquidity is mathematically impossible.

## Track

Cleanverse Build Hackathon — **Track 01: RWA (Real-World Assets, Verified)**

## Stack

| Layer | Technology |
|-------|------------|
| Chain | Monad (EVM, parallel execution) |
| Token Standard | ERC-3643 (Permissioned Security Token) |
| Compliance | Cleanverse CVI (A-Pass) + CVA (A-Token) + CCP |
| Contracts | Foundry + OpenZeppelin UUPS |
| Backend | Node.js / Express |
| Frontend | Next.js 15 + Tailwind + wagmi |
| Indexer | viem event watcher |

## Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js ≥ 18
- pnpm ≥ 9

### 1. Install dependencies

```bash
pnpm install
cd contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 OpenZeppelin/openzeppelin-contracts-upgradeable@v5.0.2
cd ..
cp .env.example .env
# Fill CLEANVERSE_API_ID, CLEANVERSE_API_KEY, DEPLOYER_PRIVATE_KEY
```

### 2. Run tests

```bash
cd contracts && forge test -vv
```

### 3. Deploy to Monad testnet

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL --broadcast
```

### 4. Start services

```bash
pnpm sync:env       # sync contract addresses from deployments/monad.json
pnpm dev:api        # :4000
pnpm dev:indexer    # :4001
pnpm dev:web        # :3000
```

See [Demo Guide](./docs/DEMO.md) for the full walkthrough.

**Free deploy (no Railway):** [DEPLOY-FREE.md](./docs/DEPLOY-FREE.md) — API on same Vercel project as Clerk.

## Project Structure

```
SovereignX/
├── contracts/          # ERC-3643 smart contracts (Foundry)
│   ├── src/
│   │   ├── token/SovereignXTBill.sol
│   │   ├── registry/IdentityRegistry.sol
│   │   ├── compliance/ComplianceEngine.sol
│   │   └── dividend/DividendDistributor.sol
│   ├── script/Deploy.s.sol
│   └── test/SovereignXTBill.t.sol
├── services/
│   ├── api/            # Cleanverse gateway + oracle + auditor
│   └── indexer/        # Monad event indexer
├── apps/web/           # Vault-themed Next.js dashboard
├── packages/shared/    # Shared TypeScript types
└── docs/ARCHITECTURE.md
```

## Key Features

- **$10 minimum fraction** — whole $10 SOVX blocks only
- **CVI-gated transfers** — sender & receiver must be Cleanverse-verified
- **CCP pre-transaction checks** — Cleanverse Rules Layer integration
- **IVMS 101 payloads** — Travel Rule data for large transfers
- **CVA dividend distribution** — payouts only to verified wallets
- **UUPS upgradability** — all core contracts upgradeable
- **No forced transfer** — compliance cryptographically enforced

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/cvi/:address` | Query CVI (A-Pass) status |
| POST | `/api/cvi/sync` | Sync A-Pass CVI on-chain |
| GET | `/api/enrollment/magiclink` | A-Pass enrollment URL |
| POST | `/api/compliance/pre-check` | CCP validation + IVMS 101 |
| POST | `/api/compliance/log-transfer` | Persist transfer audit entry |
| GET | `/api/compliance/travel-rule/:address` | Travel rule report download |
| GET | `/api/oracle/tbill` | Live T-Bill NAV / yield (Treasury.gov / FRED) |
| GET | `/api/oracle/history` | Daily NAV snapshots |
| GET | `/api/protocol/stats` | On-chain supply + live oracle |
| GET | `/api/audit/report` | Compliance audit export |
| GET | `/api/indexer/events` | On-chain SOVX Transfer events |
| GET | `/api/dividends/status` | CVA dividend pool + estimates |
| GET | `/api/validator/status` | Cleanverse validator pool status |
| POST | `/api/validator/register` | Register compliance pool |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm sync:env` | Sync `.env` from `deployments/monad.json` |
| `pnpm register:validator` | Register Cleanverse validator pool via API |
| `pnpm deposit:dividends` | Deposit CVA into dividend distributor (default $100) |

## Documentation

- [Demo Guide](./docs/DEMO.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Cleanverse API](./docs.txt) — full v5.6 reference
- [Cleanverse Docs](https://docs.cleanverse.com/docs?code=vhp3FyNV)

## License

MIT — SovereignX Hackathon Build 2026
