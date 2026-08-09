#!/usr/bin/env bash
# Deploy SovereignX API to Heroku via Container Registry (builds on Heroku — no local Docker)
#
# Usage:
#   ./scripts/deploy-heroku-container.sh YOUR-HEROKU-APP-NAME
#
# Prerequisites:
#   heroku login          (once)
#   Config vars set       (see docs/DEPLOY-HEROKU.md)

set -euo pipefail

APP="${1:-}"
if [[ -z "$APP" ]]; then
  echo "Usage: ./scripts/deploy-heroku-container.sh YOUR-HEROKU-APP-NAME"
  echo "Example: ./scripts/deploy-heroku-container.sh sovereignx-api"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v heroku >/dev/null 2>&1; then
  echo "Install Heroku CLI: brew install heroku/brew/heroku"
  exit 1
fi

echo "→ App: $APP"
echo "→ Setting stack to container (uses heroku.yml + Dockerfile.api)"
heroku stack:set container -a "$APP"

echo "→ Adding git remote (if missing)"
heroku git:remote -a "$APP" 2>/dev/null || true

echo "→ Deploying main branch..."
git push heroku main

echo ""
echo "✓ Deployed. Test:"
echo "  curl https://${APP}.herokuapp.com/api/health"
echo ""
echo "Set Config Vars if not done yet:"
echo "  pnpm generate:vercel-api-env"
echo "  heroku config:set -a $APP \$(grep -v '^#' env/vercel.api.env | xargs)"
