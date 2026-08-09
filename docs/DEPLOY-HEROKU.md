# Deploy API ke Heroku (GitHub Student Pack)

**$13/bulan × 24 bulan** — cukup untuk 1 Eco dyno ($5) + sisa credit.

Frontend + Clerk tetap di **Vercel**. Heroku cuma host **API**.

```
Vercel (Clerk)  →  Heroku API  →  Cleanverse + Monad
```

---

## 1. Klaim credit GitHub Student Pack

1. [GitHub Student Pack](https://education.github.com/pack) → aktifkan **Heroku**
2. Buat / login [Heroku](https://dashboard.heroku.com)
3. Apply **Heroku for GitHub Students** (butuh kartu debit/kredit — hanya charge kalau lewat $13/bulan)
4. Cek **Account Settings → Billing** → harus ada **$312 platform credits**

> Apply di **awal bulan** supaya $13 credit bulan itu tidak hangus.

---

## 2. Buat Heroku app

**Dashboard → New → Create new app**

- Name: `sovereignx-api` (atau bebas)
- Region: United States (dekat Cleanverse UAT)

**Deploy method:** GitHub → Connect repo `IrrhammCode/SovereignX` → branch `main`

---

## 3. Set Config Vars

Dashboard → app → **Settings → Reveal Config Vars**

Dari laptop:

```bash
pnpm generate:vercel-api-env
```

Copy semua baris dari `env/vercel.api.env` ke Heroku Config Vars **satu per satu**, atau paste via CLI:

```bash
heroku login
heroku config:set -a sovereignx-api \
  CLEANVERSE_API_ID=xxx \
  CLEANVERSE_API_KEY=xxx \
  ...
```

**Wajib tambah:**

```
ALLOWED_ORIGINS=https://YOUR-APP.vercel.app
NODE_ENV=production
```

**Jangan set** `API_PORT` — Heroku inject `PORT` otomatis (sudah didukung code).

**Hapus / jangan set** `INDEXER_URL=localhost` — indexer opsional (audit log bisa kosong).

---

## 4. Deploy

### Opsi A · GitHub auto-deploy (recommended)

Settings → Deploy → **Enable Automatic Deploys** dari `main`

Manual deploy: tab **Deploy → Deploy Branch**

Heroku akan:
1. `pnpm install` (detect dari `packageManager`)
2. `heroku-postbuild` → build shared + api
3. Start `Procfile` → `node services/api/dist/index.js`

### Opsi B · Container (Docker) — **tanpa Docker lokal**

Heroku build image dari `Dockerfile.api` via `heroku.yml`. **Tidak perlu** `docker ps` di laptop.

```bash
brew install heroku/brew/heroku   # sudah terinstall
heroku login                      # browser login, sekali saja
./scripts/deploy-heroku-container.sh NAMA-APP-KAMU
```

Manual:

```bash
heroku stack:set container -a NAMA-APP-KAMU
heroku git:remote -a NAMA-APP-KAMU
git push heroku main
```

### Opsi C · Container Registry CLI (butuh Docker Desktop lokal)

Hanya kalau sudah install [Docker Desktop](https://www.docker.com/products/docker-desktop/):

```bash
heroku login
heroku container:login
heroku container:push web -a NAMA-APP-KAMU -f Dockerfile.api
heroku container:release web -a NAMA-APP-KAMU
```

---

## 5. Test

```bash
curl https://sovereignx-api.herokuapp.com/api/health
```

Harus return `{"status":"ok",...}`

---

## 6. Hubungkan Vercel

```bash
pnpm generate:vercel-env --split https://sovereignx-api.herokuapp.com
```

Vercel → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://sovereignx-api.herokuapp.com
```

Redeploy Vercel → test dashboard enrollment.

---

## Biaya & dyno plan

| Resource | Harga | Student credit |
|----------|-------|----------------|
| **Eco dyno** (API) | $5/bulan | ✅ muat di $13 |
| Basic dyno | $7/bulan | ✅ |
| Mini Postgres | $5/bulan | opsional, tidak perlu untuk SovereignX |
| Indexer (dyno ke-2) | +$5/bulan | skip untuk MVP |

**Rekomendasi:** 1× **Eco dyno** untuk API saja. Indexer skip dulu.

Settings → **Resources** → turn OFF dynos yang tidak dipakai.

---

## CLI cheat sheet

```bash
npm i -g heroku   # atau brew install heroku/brew/heroku
heroku login
heroku logs --tail -a sovereignx-api
heroku restart -a sovereignx-api
heroku config -a sovereignx-api
```

---

## Troubleshooting

| Masalah | Fix |
|---------|-----|
| Build gagal `pnpm` | Pastikan `packageManager` ada di root `package.json` |
| App crashed H10 | `heroku logs --tail` — cek env vars |
| CORS error | Set `ALLOWED_ORIGINS` = URL Vercel exact |
| CVI sync gagal | Cek `DEPLOYER_PRIVATE_KEY` di Config Vars |
| Over credit | Eco dyno saja, matikan dyno/indexer extra |

---

## Indexer (opsional, bulan depan)

Buat **Heroku app kedua** `sovereignx-indexer` + `Dockerfile.indexer`, lalu set di API:

```
INDEXER_URL=https://sovereignx-indexer.herokuapp.com
```

Untuk hackathon MVP, **API saja sudah cukup**.
