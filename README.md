<div align="center">

# 🏛️ SovereignX (SOVX) — Fractionalized US T-Bills on Monad

> **Permissioned RWA tokenization with ERC-3643 compliance and Cleanverse CVI/CVA — toxic liquidity is mathematically impossible.**

[![Monad](https://img.shields.io/badge/Chain-Monad-836EF9?style=for-the-badge)](https://monad.xyz/)
[![ERC-3643](https://img.shields.io/badge/Standard-ERC--3643-blue?style=for-the-badge)](https://erc3643.org/)
[![Cleanverse](https://img.shields.io/badge/Compliance-Cleanverse-10B981?style=for-the-badge)](https://cleanverse.com/)
[![Hackathon: Cleanverse Build](https://img.shields.io/badge/Hackathon-Cleanverse__Build-purple?style=for-the-badge)](https://cleanverse.com/hackathon)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Live App:** [sovereign-x-web.vercel.app](https://sovereign-x-web.vercel.app) · **API:** [sovereignx.herokuapp.com](https://sovereignx-287a5c8c5f63.herokuapp.com/api/health)

</div>

---

## ⏱️ How SovereignX Works in 10 Seconds

SovereignX turns US Treasury Bills into **$10 on-chain fractions (SOVX)** with cryptographic compliance:

1. **User enrolls** Cleanverse A-Pass (CVI identity verification).
2. ↓ **Relayer syncs** verified CVI to Monad `IdentityRegistry`.
3. ↓ **User claims** demo SOVX or receives mint from agent.
4. ↓ **CCP pre-check** validates sender, receiver, and amount off-chain.
5. ↓ **On-chain transfer** runs ERC-3643 modifiers on Monad.
6. ↓ **Failed compliance reverts atomically** — SOVX stays in the sender wallet.

---

## ⚡ Quick Start

```bash
# 1. Clone
git clone https://github.com/IrrhammCode/SovereignX.git
cd SovereignX

# 2. Install
pnpm install
cd contracts && forge install && cd ..
cp .env.example .env
# Fill CLEANVERSE_API_ID, CLEANVERSE_API_KEY, DEPLOYER_PRIVATE_KEY

# 3. Sync deployed addresses & run locally
pnpm sync:env
pnpm dev:api    # http://localhost:4000
pnpm dev:web    # http://localhost:3000
```

**Try live (no clone needed):** [Dashboard](https://sovereign-x-web.vercel.app/dashboard) → Connect MetaMask on Monad Testnet → Enroll A-Pass → Sync CVI → Claim demo SOVX.

---

## 🌍 Project Overview

**What is SovereignX?**  
SovereignX (SOVX) is a **Real-World Asset (RWA)** protocol that fractionalizes US Treasury Bills into **$10 permissioned tokens** on **Monad**, enforcing **ERC-3643** transfer rules and **Cleanverse** compliance (CVI, CVA, CCP).

**Why does it exist?**  
RWAs on public chains face a fatal trust gap: anyone can receive “tokenized” assets without identity checks. SovereignX makes **non-compliant liquidity mathematically impossible** — transfers to unverified or sanctioned wallets **revert on-chain**.

**Who is it for?**

- **Retail / qualified investors** seeking fractional T-Bill exposure with verifiable compliance.
- **Institutions** needing IVMS 101 travel rule data and audit trails.
- **Hackathon judges & developers** evaluating permissioned token standards on high-throughput EVM.

**How does it improve RWA on-chain?**  
By binding **Cleanverse CVI (A-Pass)** to **IdentityRegistry**, running **CCP pre-transaction checks**, and enforcing rules in **ComplianceEngine** + **SovereignXTBill** modifiers — with **no admin forced-transfer override**.

---

## 🌐 Live Deployment (Monad Testnet)

| Resource | URL |
|----------|-----|
| **Frontend** | https://sovereign-x-web.vercel.app |
| **API** | https://sovereignx-287a5c8c5f63.herokuapp.com |
| **Explorer** | https://testnet.monadscan.com |

| Contract | Address |
|----------|---------|
| SOVX Token | [`0x03f6E30518347135049be7ABc901f727489E79A0`](https://testnet.monadscan.com/address/0x03f6E30518347135049be7ABc901f727489E79A0) |
| IdentityRegistry | [`0x935AbfE82F9Abcc99a25f8252230d991887eB36d`](https://testnet.monadscan.com/address/0x935AbfE82F9Abcc99a25f8252230d991887eB36d) |
| ComplianceEngine | [`0x622fBD1835B855334A2033ebF61Ad56f3d095286`](https://testnet.monadscan.com/address/0x622fBD1835B855334A2033ebF61Ad56f3d095286) |
| DividendDistributor | [`0x62059f45007d65Ff127128b8Bb2f77d93aAfca11`](https://testnet.monadscan.com/address/0x62059f45007d65Ff127128b8Bb2f77d93aAfca11) |

**Monad Testnet RPC:** `https://testnet-rpc.monad.xyz` · **Chain ID:** `10143` · **Symbol:** `MON`

---

## 👩‍⚖️ For Judges (Self-Serve Demo)

No private keys required. Any MetaMask wallet works:

1. Open **[Live Dashboard](https://sovereign-x-web.vercel.app/dashboard)**
2. Connect wallet → **Switch to Monad Testnet**
3. Sign in with Google (Clerk dual-auth)
4. **Enroll A-Pass** via Cleanverse magic link (KYC testnet)
5. Click **Sync CVI On-Chain**
6. Click **Claim 2 × $10 SOVX** (Demo Faucet)
7. **CCP Pre-Check** → **Execute Transfer** $10 to another verified wallet
8. View **Audit Logs** (CCP trail + on-chain Transfer events)

> **Only 1 KTP?** Use your enrolled wallet as receiver; import deployer account in MetaMask as sender (already holds SOVX). See [Demo Guide](./docs/DEMO.md).

> **Demo video:** _(add YouTube link before submission)_

---

## 📂 Repository Structure

| Component | Directory | Description |
|-----------|-----------|-------------|
| **Smart Contracts** | [`/contracts`](./contracts/) | ERC-3643 SOVX token, IdentityRegistry, ComplianceEngine, DividendDistributor (Foundry + UUPS) |
| **API Gateway** | [`/services/api`](./services/api/) | Cleanverse Cooperate API, CVI relayer, CCP, oracle, audit, SOVX faucet |
| **Frontend** | [`/apps/web`](./apps/web/) | Next.js 15 vault dashboard — enrollment, transfer, dividends, audit |
| **Shared Types** | [`/packages/shared`](./packages/shared/) | ABIs, types, env loader |
| **Indexer** | [`/services/indexer`](./services/indexer/) | Optional local event watcher (production uses API + Monad RPC) |

```text
SovereignX/
├── contracts/              # Foundry — ERC-3643 core
│   ├── src/token/SovereignXTBill.sol
│   ├── src/registry/IdentityRegistry.sol
│   ├── src/compliance/ComplianceEngine.sol
│   ├── src/dividend/DividendDistributor.sol
│   └── script/Deploy.s.sol
├── services/
│   ├── api/                # Express API (Heroku / VPS / Vercel embed)
│   └── indexer/            # Optional viem watcher
├── apps/web/               # Next.js dashboard + Clerk auth
├── packages/shared/        # Shared TS + ABIs
├── deployments/monad.json  # Canonical testnet addresses
└── docs/                   # Architecture, deploy, demo guides
```

---

## 🚨 Problem Statement

Tokenized RWAs on public blockchains inherit a structural compliance failure:

- **Toxic liquidity:** Unverified wallets can receive security tokens if transfers are not permissioned.
- **Off-chain-only KYC:** Identity checks that never reach the chain are bypassable at settlement.
- **Black-box compliance:** No auditable trail linking CCP decisions to on-chain outcomes.
- **Travel Rule gaps:** Cross-border transfers lack IVMS 101 payloads for institutional reporting.
- **Admin override risk:** Many “compliant” tokens allow forced transfer — undermining investor protection.

---

## 💡 Solution

SovereignX enforces compliance **cryptographically on Monad**:

- **ERC-3643 permissioned token** — `SovereignXTBill` (SOVX) with verified sender/receiver modifiers.
- **On-chain CVI mirror** — `IdentityRegistry` synced from Cleanverse A-Pass via API relayer.
- **ComplianceEngine** — tier, country, sanction, and CCP-aligned `canTransfer()` rules.
- **CCP pre-transaction checks** — Cleanverse Cooperate API before wallet signs transfer.
- **IVMS 101 payloads** — travel rule data for transfers ≥ $3,000 threshold.
- **CVA dividend rail** — `DividendDistributor` pays verified holders in Cleanverse A-Token (ausdc).
- **Demo SOVX faucet** — verified wallets self-claim test fractions for judges and testers.
- **No forced transfer** — `forcedTransfer` permanently disabled; failed checks revert atomically.

> **Core guarantee:** *Toxic liquidity is mathematically impossible.*

---

## 💎 Key Features

- **$10 minimum fraction** — whole $10 SOVX blocks only (6 decimals).
- **CVI-gated mint / transfer / burn** — both parties must be verified on-chain.
- **Cleanverse CCP integration** — pre-check before on-chain execution.
- **Live T-Bill oracle** — Treasury.gov / FRED yield for NAV and dividend estimates.
- **Compliance audit trail** — JSON/CSV export of CCP-logged transfers.
- **On-chain event feed** — SOVX `Transfer` logs via Monad RPC (no separate indexer dyno).
- **Dual auth** — MetaMask + Clerk Google for demo-ready UX.
- **UUPS upgradeable** — all core contracts upgradeable via OpenZeppelin proxies.

---

## 🏆 Hackathon Track Response: RWA (Verified)

**Cleanverse Build Hackathon — Track 01: RWA (Real-World Assets, Verified)**

| Question | Answer |
|----------|--------|
| **What** | Fractionalized US T-Bill token (SOVX) on Monad with ERC-3643 + Cleanverse CVI/CVA/CCP |
| **Why** | Prevent toxic liquidity — only verified identities can hold or transfer RWA fractions |
| **Who** | Investors, institutions, and compliance officers needing auditable on-chain RWA |
| **Where** | Monad testnet + Cleanverse UAT API + Vercel/Heroku production stack |
| **When** | CVI synced **before** mint/transfer; CCP runs **before** wallet submits tx |
| **How** | IdentityRegistry + ComplianceEngine + atomic revert on any failed modifier |

<details>
<summary>🔎 Proof of Implementation (Code Evidence)</summary>

- **Permissioned transfer modifiers:** [`SovereignXTBill.sol` — `onlyVerifiedSender` / `onlyVerifiedReceiver`](./contracts/src/token/SovereignXTBill.sol)
- **Atomic revert on CCP failure:** [`SovereignXTBill.sol` — `withFailureStateSafety`](./contracts/src/token/SovereignXTBill.sol)
- **Forced transfer disabled:** [`SovereignXTBill.sol` — `forcedTransfer` revert](./contracts/src/token/SovereignXTBill.sol)
- **On-chain compliance rules:** [`ComplianceEngine.sol` — `canTransfer()`](./contracts/src/compliance/ComplianceEngine.sol)
- **CVI relayer (A-Pass → chain):** [`cvi-relayer.ts`](./services/api/src/services/cvi-relayer.ts)
- **CCP + IVMS 101:** [`ccp.ts`](./services/api/src/integrations/cleanverse/ccp.ts)
- **Demo SOVX faucet:** [`sovx-faucet.ts`](./services/api/src/services/sovx-faucet.ts)
- **Transfer UI + audit logging:** [`TransferPanel.tsx`](./apps/web/src/components/TransferPanel.tsx)
- **Judge self-serve claim UI:** [`SovxClaimPanel.tsx`](./apps/web/src/components/SovxClaimPanel.tsx)
- **Monad RPC chain events:** [`chain-events.ts`](./services/api/src/services/chain-events.ts)

</details>

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        USER / JUDGE / INVESTOR                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Next.js Dashboard   │
                    │  wagmi · Clerk · UI   │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
     ┌────────────┐    ┌─────────────┐   ┌──────────────┐
     │  Express   │    │  MetaMask   │   │  Cleanverse  │
     │    API     │    │  (Monad tx) │   │  Cooperate   │
     └─────┬──────┘    └──────┬──────┘   └──────┬───────┘
           │                  │                  │
           │    CVI sync      │   transfer()     │ CCP / A-Pass
           │    CCP check     │                  │ IVMS 101
           │    Oracle        │                  │
           ▼                  ▼                  │
     ┌──────────────────────────────────────────┴───┐
     │              MONAD TESTNET (EVM)              │
     │  SovereignXTBill · IdentityRegistry ·         │
     │  ComplianceEngine · DividendDistributor       │
     └──────────────────────────────────────────────┘
```

See full diagram: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## ⚙️ Protocol Execution Flow

### A. Enrollment & Claim (Judge Path)

1. User opens A-Pass magic link → completes Cleanverse KYC (CVI).
2. API `POST /api/cvi/sync` reads A-Pass → writes `IdentityRegistry.registerIdentity`.
3. User clicks **Claim demo SOVX** → API mints `2 × $10` to verified wallet (once per address).
4. Dashboard shows SOVX balance and compliance status.

### B. Compliant Transfer (User A → User B)

1. Frontend calls `POST /api/compliance/pre-check` (CCP + IVMS 101 if ≥ $3k).
2. User A signs `SovereignXTBill.transfer(B, amount)` on Monad.
3. Contract runs modifiers: verified sender/receiver, not frozen, `canTransfer`, whole $10 fractions.
4. **Success:** Transfer executes; API logs audit entry; chain events indexed via RPC.
5. **Failure:** Full revert — SOVX remains in User A's wallet (e.g. unverified receiver).

### C. Dividend Rail (CVA)

1. Institution deposits CVA (ausdc) into `DividendDistributor`.
2. Verified SOVX holders claim pro-rata CVA payouts.
3. Unverified wallets cannot receive dividend distributions.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Blockchain | **Monad Testnet** | High-throughput EVM execution |
| Token Standard | **ERC-3643** | Permissioned security token (SOVX) |
| Compliance | **Cleanverse** | CVI (A-Pass), CVA (A-Token), CCP, IVMS 101 |
| Smart Contracts | **Foundry + OpenZeppelin UUPS** | Upgradeable RWA core |
| Backend | **Node.js / Express** | Cleanverse gateway, relayer, oracle, faucet |
| Frontend | **Next.js 15 + wagmi + Tailwind** | Vault dashboard |
| Auth | **Clerk + MetaMask** | Dual-auth demo UX |
| Oracle | **Treasury.gov / FRED** | Live T-Bill yield & NAV |
| Indexing | **viem `getLogs`** | On-chain Transfer events (in API) |
| Deploy | **Vercel + Heroku** | Frontend + API production |

---

## 🔐 Smart Contract Architecture

| Contract | Role |
|----------|------|
| `SovereignXTBill` | ERC-3643 SOVX token — $10 fractions, verified transfer path |
| `IdentityRegistry` | On-chain CVI mirror — tier, expiry, country, sanctions |
| `ComplianceEngine` | `canTransfer()` — tier/country/sanction gates |
| `DividendDistributor` | CVA dividend pool — verified recipients only |
| `SovereignXProxy` | UUPS proxy wrapper for all upgradeable contracts |

**Compliance modifiers on every transfer:**

```
onlyVerifiedSender → onlyVerifiedReceiver → withComplianceRules → withFailureStateSafety
```

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/enrollment/magiclink` | A-Pass enrollment URL |
| GET | `/api/cvi/:address` | Query Cleanverse CVI status |
| POST | `/api/cvi/sync` | Sync A-Pass CVI on-chain |
| GET | `/api/faucet/sovx/status?wallet=` | Demo SOVX claim eligibility |
| POST | `/api/faucet/sovx` | Mint 2× $10 SOVX (verified, once) |
| POST | `/api/faucet/cva` | Request test CVA from Cleanverse |
| POST | `/api/compliance/pre-check` | CCP validation + IVMS 101 |
| POST | `/api/compliance/log-transfer` | Persist transfer audit entry |
| POST | `/api/compliance/travel-rule` | Travel rule report download |
| GET | `/api/oracle/tbill` | Live T-Bill NAV / yield |
| GET | `/api/oracle/history` | Daily NAV snapshots |
| GET | `/api/protocol/stats` | On-chain supply + oracle |
| GET | `/api/audit/report` | Compliance audit export (JSON/CSV) |
| GET | `/api/indexer/events` | On-chain SOVX Transfer events |
| GET | `/api/dividends/status` | CVA dividend pool + estimates |
| GET | `/api/validator/status` | Cleanverse validator pool status |
| POST | `/api/validator/register` | Register compliance pool |

---

## 💻 Installation Guide

**Prerequisites:** [Foundry](https://book.getfoundry.sh/), Node.js ≥ 18, pnpm ≥ 9

```bash
git clone https://github.com/IrrhammCode/SovereignX.git
cd SovereignX

pnpm install
cd contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 OpenZeppelin/openzeppelin-contracts-upgradeable@v5.0.2
cd ..

cp .env.example .env
# Required: CLEANVERSE_API_ID, CLEANVERSE_API_KEY, DEPLOYER_PRIVATE_KEY
pnpm sync:env
```

---

## 🔑 Environment Variables

```ini
# Cleanverse Cooperate API v5.6
CLEANVERSE_API_ID=your_api_id
CLEANVERSE_API_KEY=your_base64_api_key
CLEANVERSE_API_URL=https://uatapi.cleanverse.com/api/cooperate
CLEANVERSE_SKILLS_URL=https://uatapi.cleanverse.com/api/skills

# Monad
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
DEPLOYER_PRIVATE_KEY=0x...

# Deployed contracts (see deployments/monad.json)
SOVX_TOKEN_ADDRESS=0x03f6E30518347135049be7ABc901f727489E79A0
IDENTITY_REGISTRY_ADDRESS=0x935AbfE82F9Abcc99a25f8252230d991887eB36d
COMPLIANCE_ENGINE_ADDRESS=0x622fBD1835B855334A2033ebF61Ad56f3d095286
DIVIDEND_DISTRIBUTOR_ADDRESS=0x62059f45007d65Ff127128b8Bb2f77d93aAfca11

# Demo faucet
SOVX_FAUCET_FRACTIONS=2
SOVX_FAUCET_CLAIMS_PATH=./data/sovx-faucet-claims.json

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://sovereignx-287a5c8c5f63.herokuapp.com
NEXT_PUBLIC_SOVX_TOKEN_ADDRESS=0x03f6E30518347135049be7ABc901f727489E79A0

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Full reference: [`.env.example`](./.env.example)

Generate Vercel/Heroku env files:

```bash
pnpm generate:vercel-env --split https://sovereignx-287a5c8c5f63.herokuapp.com
pnpm generate:vercel-api-env
```

---

## 🚀 Running the Project

```bash
# Terminal 1 — API
pnpm dev:api          # http://localhost:4000

# Terminal 2 — Frontend
pnpm dev:web          # http://localhost:3000

# Optional — local indexer (not required for production)
pnpm dev:indexer      # http://localhost:4001
```

| Page | URL |
|------|-----|
| Landing | http://localhost:3000 |
| Dashboard | http://localhost:3000/dashboard |

---

## 🧪 Testing

```bash
# Smart contract unit tests
cd contracts && forge test -vv

# Request demo SOVX via CLI (wallet must be CVI-synced)
pnpm faucet:sovx 0xYourWallet

# Request test CVA (Cleanverse faucet)
pnpm faucet:cva 0xYourWallet 100

# API health
curl http://localhost:4000/api/health
```

---

## 📤 Deployment

| Target | Guide |
|--------|-------|
| **Vercel (frontend)** | Auto-deploy from `main`; set `NEXT_PUBLIC_*` env vars |
| **Heroku (API)** | [docs/DEPLOY-HEROKU.md](./docs/DEPLOY-HEROKU.md) |
| **Vercel embedded API** | [docs/DEPLOY-FREE.md](./docs/DEPLOY-FREE.md) |
| **VPS (Docker)** | [docs/DEPLOY-VPS.md](./docs/DEPLOY-VPS.md) |

```bash
# Heroku container deploy (no local Docker required)
./scripts/deploy-heroku-container.sh sovereignx

# Contracts to Monad testnet
cd contracts
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL --broadcast
forge script script/PostDeploy.s.sol --rpc-url $MONAD_RPC_URL --broadcast
```

---

## 📜 Example: CCP Audit Log Entry

```json
{
  "txHash": "0xabc123...",
  "from": "0xSender...",
  "to": "0xReceiver...",
  "amount": "10",
  "ccpPassed": true,
  "ivms101": {
    "originator": { "accountNumber": "0xSender..." },
    "beneficiary": { "accountNumber": "0xReceiver..." }
  }
}
```

Export full report: `GET /api/audit/report?format=download`

---

## 💼 Core Use Cases

- 🏦 **Fractional T-Bill exposure** — $10 minimum blocks for retail access.
- 🛡️ **Permissioned RWA settlement** — verified-only transfers on Monad.
- 📋 **Regulatory audit trail** — CCP logs + on-chain event correlation.
- 🌐 **Cross-border travel rule** — IVMS 101 for institutional reporting.
- 💰 **Verified dividend rail** — CVA payouts to CVI-synced SOVX holders.
- 🧪 **Hackathon demo** — self-serve judge flow with demo SOVX faucet.

---

## 🔭 Future Vision

- **Mainnet deployment** with audited contracts and institutional mint pipeline.
- **Persistent event store** (Postgres) replacing ephemeral Heroku filesystem.
- **Multi-jurisdiction rule packs** via Cleanverse validator pool rules.
- **Secondary market integration** with permissioned DEX hooks.
- **Automated NAV oracle attestations** on-chain.

---

## 🗺️ Roadmap

| Phase | Milestone |
|-------|-----------|
| **Phase 1 — Hackathon MVP** | Monad testnet deploy, CVI/CCP integration, demo faucet, audit UI |
| **Phase 2 — Pilot** | Mainnet contracts, institutional onboarding, travel rule automation |
| **Phase 3 — Scale** | Multi-asset RWA vault, validator pool governance, audited upgrades |

---

## 📚 Documentation

| Doc | Description |
|-----|-------------|
| [Demo Guide](./docs/DEMO.md) | Step-by-step demo + judge instructions |
| [Architecture](./docs/ARCHITECTURE.md) | System design, mermaid diagrams, modifier flow |
| [Deploy Heroku](./docs/DEPLOY-HEROKU.md) | API on Heroku (GitHub Student credits) |
| [Deploy Free](./docs/DEPLOY-FREE.md) | Vercel embedded API option |
| [Deploy VPS](./docs/DEPLOY-VPS.md) | Docker on VPS |
| [Cleanverse Docs](https://docs.cleanverse.com/docs?code=vhp3FyNV) | CVI / CVA / CCP reference |

---

## 🎥 Demo

| Resource | Link |
|----------|------|
| **Live Dashboard** | https://sovereign-x-web.vercel.app/dashboard |
| **Demo Video** | _(add before submission)_ |
| **Contract Explorer** | https://testnet.monadscan.com/address/0x03f6E30518347135049be7ABc901f727489E79A0 |

---

## 📋 Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm sync:env` | Sync `.env` from `deployments/monad.json` |
| `pnpm dev:api` | Start Express API (:4000) |
| `pnpm dev:web` | Start Next.js frontend (:3000) |
| `pnpm test:contracts` | Run Foundry tests |
| `pnpm deploy:testnet` | Deploy contracts to Monad |
| `pnpm faucet:sovx` | Claim demo SOVX via API |
| `pnpm faucet:cva` | Request test CVA from Cleanverse |
| `pnpm deposit:dividends` | Seed CVA dividend pool |
| `pnpm register:validator` | Register Cleanverse validator pool |
| `pnpm generate:vercel-env` | Generate Vercel frontend env |
| `pnpm generate:vercel-api-env` | Generate Heroku/API env |

---

## 🤝 Contributing

1. Fork the repo and create a branch from `main`.
2. Run `forge test` for contract changes.
3. Keep diffs focused — match existing conventions.
4. Open a PR with a clear description and test plan.

---

## 🔐 Security Disclosure

SovereignX is a **hackathon / testnet** project. **Do not deploy mainnet funds without professional smart contract audits.**

- `DEPLOYER_PRIVATE_KEY` holds `AGENT_ROLE` — protect at all costs.
- Demo faucet mints real testnet SOVX — rate-limited to verified wallets only.
- Heroku filesystem for claim tracking is ephemeral — resets on dyno restart.

Report vulnerabilities privately — do not open public issues for exploit details.

---

## ⚠️ Known Limitations

- **Validator pool auto-registration** may fail (`ComplianceEngine` uses AccessControl, not `owner()`) — register via Cleanverse dashboard for production.
- **Heroku ephemeral disk** — faucet claim records and audit logs reset on dyno restart unless persistent storage is added.
- **Monad RPC rate limits** — `getLogs` chunked to 100 blocks with throttle; deep historical scans are slow.
- **1 KTP → 1 A-Pass identity** — full verified→verified demo between two “user” wallets needs two enrollments or deployer as counterparty.
- **Cleanverse UAT** — enrollment and CCP depend on Cleanverse testnet API availability.

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| **API offline on Vercel** | Set `NEXT_PUBLIC_API_URL` to Heroku URL (no trailing slash) and redeploy |
| **CORS errors** | Set `ALLOWED_ORIGINS=https://sovereign-x-web.vercel.app` on Heroku |
| **Claim SOVX disabled** | Complete A-Pass enrollment → Sync CVI first |
| **Transfer reverts** | Ensure receiver is CVI-synced on-chain; amount must be whole $10 |
| **Wrong network** | Switch MetaMask to Monad Testnet (chain ID 10143) |
| **No MON for gas** | Get Monad testnet MON from faucet |

---

## 📄 License

MIT — SovereignX Hackathon Build 2026. See [LICENSE](./LICENSE) if present.

---

## 🙌 Credits

- **Cleanverse Build Hackathon** — Track 01: RWA (Verified)
- **Monad** — High-performance EVM testnet
- **Cleanverse** — CVI, CVA, CCP compliance infrastructure
- **OpenZeppelin** — UUPS upgradeable contract patterns
- **ERC-3643 Association** — Permissioned token standard

---

<div align="center">

**Built with ❤️ for verifiable RWAs on Monad**

[Live App](https://sovereign-x-web.vercel.app) · [API Health](https://sovereignx-287a5c8c5f63.herokuapp.com/api/health) · [GitHub](https://github.com/IrrhammCode/SovereignX)

</div>
