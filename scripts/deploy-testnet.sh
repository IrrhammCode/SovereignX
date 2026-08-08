#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Load env
set -a; source .env; set +a

if ! command -v forge &>/dev/null; then
  echo "ERROR: Foundry not installed. Run: curl -L https://foundry.paradigm.xyz | bash && foundryup"
  exit 1
fi

cd contracts
if [ ! -d lib/openzeppelin-contracts ]; then
  forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit
  forge install OpenZeppelin/openzeppelin-contracts-upgradeable@v5.0.2 --no-commit
fi

echo "==> Building & testing..."
forge build
forge test -vv

echo "==> Deploying to Monad testnet..."
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "${MONAD_RPC_URL}" \
  --broadcast \
  -vvv 2>&1 | tee /tmp/sovereignx-deploy.log

# Parse addresses from console output
REGISTRY=$(rg -o 'IdentityRegistry: 0x[a-fA-F0-9]{40}' /tmp/sovereignx-deploy.log | tail -1 | awk '{print $2}')
COMPLIANCE=$(rg -o 'ComplianceEngine: 0x[a-fA-F0-9]{40}' /tmp/sovereignx-deploy.log | tail -1 | awk '{print $2}')
SOVX=$(rg -o 'SovereignXTBill: 0x[a-fA-F0-9]{40}' /tmp/sovereignx-deploy.log | tail -1 | awk '{print $2}')
DIVIDEND=$(rg -o 'DividendDistributor: 0x[a-fA-F0-9]{40}' /tmp/sovereignx-deploy.log | tail -1 | awk '{print $2}')

cd "$ROOT"
node scripts/save-deployments.mjs \
  --registry "$REGISTRY" \
  --compliance "$COMPLIANCE" \
  --sovx "$SOVX" \
  --dividend "$DIVIDEND" \
  --cva "${CVA_STABLECOIN_ADDRESS:-0xaC0893567D43C3E7e6e35a72803df05416C1f20D}"

echo "==> Deploy complete. Addresses saved to deployments/monad.json"
echo "Next: enroll A-Pass → POST /api/cvi/sync → optional PostDeploy mint"
