#!/usr/bin/env bash
set -euo pipefail

echo "==> SovereignX setup"

if ! command -v forge &>/dev/null; then
  echo "Foundry not found. Install: curl -L https://foundry.paradigm.xyz | bash && foundryup"
  exit 1
fi

pnpm install

cd contracts
if [ ! -d lib/openzeppelin-contracts ]; then
  forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit
  forge install OpenZeppelin/openzeppelin-contracts-upgradeable@v5.0.2 --no-commit
fi
forge build
forge test -vv

echo "==> Setup complete. Copy .env.example to .env and run: pnpm dev"
