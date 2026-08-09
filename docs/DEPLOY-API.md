# Deploy API (Railway) + Frontend (Vercel + Clerk)

## Clerk vs API — beda peran

| Layer | Host | Clerk? |
|-------|------|--------|
| **Frontend** (`apps/web`) | **Vercel** | ✅ Ya — login Google/email |
| **API** (`services/api`) | **Railway / Render** | ❌ Tidak perlu — pakai Cleanverse keys server-side |
| **Indexer** (opsional) | Railway service ke-2 | ❌ |

Clerk **bukan** tempat deploy API. Yang sudah kamu deploy di Vercel + Clerk **tetap dipakai** untuk frontend. API cukup di-host terpisah, lalu frontend diarahkan lewat `NEXT_PUBLIC_API_URL`.

```
Browser → Vercel (Clerk auth + Next.js) → Railway API → Cleanverse + Monad
```

---

## Step 1 — Generate env untuk Railway

Dari root repo (`.env` harus sudah terisi):

```bash
pnpm generate:vercel-api-env
```

File output: `env/vercel.api.env` (gitignored, berisi secrets).

Edit manual jika perlu:

```bash
ALLOWED_ORIGINS=https://sovereignx.vercel.app,http://localhost:3000
```

Ganti dengan URL Vercel kamu yang sebenarnya.

---

## Step 2 — Deploy API ke Railway

1. Buka [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → repo `SovereignX`
2. **Settings → Build**
   - Builder: **Dockerfile**
   - Dockerfile path: `Dockerfile.api`
3. **Variables** → **Raw Editor** → paste isi `env/vercel.api.env`
   - Railway otomatis set `PORT` — jangan override
   - Hapus baris `API_PORT` jika bentrok (opsional)
4. **Settings → Networking** → **Generate Domain**
5. Test: `curl https://YOUR-API.up.railway.app/api/health`

Harus return JSON `{ "status": "ok", ... }`.

---

## Step 3 — (Opsional) Deploy Indexer

Service kedua di project Railway yang sama:

1. **+ New Service** → same repo
2. Dockerfile: `Dockerfile.indexer`
3. Variables: `MONAD_RPC_URL`, `MONAD_CHAIN_ID`, `SOVX_TOKEN_ADDRESS`, `INDEXER_FROM_BLOCK=51873800`
4. Generate domain → mis. `https://sovereignx-indexer.up.railway.app`
5. Update API service: `INDEXER_URL=https://sovereignx-indexer.up.railway.app`
6. Redeploy API

Tanpa indexer: dashboard audit log / events mungkin kosong — core flow (CVI, transfer, oracle) tetap jalan.

---

## Step 4 — Hubungkan Vercel (Clerk frontend)

Vercel Dashboard → Project SovereignX → **Settings → Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://YOUR-API.up.railway.app
```

(Tanpa trailing slash)

Atau regenerate:

```bash
pnpm generate:vercel-env https://YOUR-API.up.railway.app
```

Import `env/vercel.env` di Vercel → **Redeploy**.

Clerk keys (`NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`) **tetap di Vercel** — tidak perlu dipindah ke Railway.

---

## Step 5 — Verifikasi end-to-end

1. Buka URL Vercel → Connect MetaMask → Sign in Google (Clerk)
2. Dashboard → **Open A-Pass Enrollment** (harus buka magic link, bukan error)
3. **Sync CVI On-Chain**
4. Transfer pre-check

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS error di browser | Set `ALLOWED_ORIGINS` di Railway = URL Vercel exact |
| `502` enrollment | Cek `CLEANVERSE_API_ID` / `CLEANVERSE_API_KEY` di Railway |
| CVI sync gagal | Cek `DEPLOYER_PRIVATE_KEY` + contract addresses |
| Indexer offline | Deploy indexer atau abaikan untuk demo MVP |
| API health OK tapi frontend error | Redeploy Vercel setelah update `NEXT_PUBLIC_API_URL` |

---

## Local Docker test

```bash
pnpm generate:vercel-api-env
docker build -f Dockerfile.api -t sovereignx-api .
docker run -p 4000:4000 --env-file env/vercel.api.env sovereignx-api
curl http://localhost:4000/api/health
```
