# Deploy gratis — SovereignX

## Opsi A · Vercel saja ($0) — **paling gampang**

Frontend + API **satu project Vercel** (Clerk tetap di sini). Tidak perlu Railway/Render.

### Langkah

1. Vercel → project SovereignX → **Settings → Environment Variables**
2. Tambahkan **semua** variabel dari dua file ini:
   - `env/vercel.env.example` (frontend + Clerk)
   - `env/vercel.api.env.example` (Cleanverse + deployer key) — **kecuali** `API_PORT`
3. **`NEXT_PUBLIC_API_URL` — kosongkan / jangan set** → frontend pakai same-origin `/api/...`
4. Redeploy

Generate file env dari `.env` lokal:

```bash
pnpm generate:vercel-env
# Paste isi env/vercel.env ke Vercel (hapus baris NEXT_PUBLIC_API_URL jika ada)
pnpm generate:vercel-api-env
# Paste juga secret API ke Vercel project yang sama
```

### Catatan Vercel free

| | |
|---|---|
| ✅ Gratis | Hobby plan, no card untuk basic |
| ✅ Clerk | Tetap di Vercel |
| ⚠️ Timeout | Max **10 detik** per request — CVI sync on-chain bisa lambat; coba lagi atau demo lokal |
| ⚠️ Indexer | Tidak jalan di serverless — audit events bisa kosong (OK untuk demo MVP) |

---

## Opsi B · Render.com free ($0)

API Express terpisah, **plan Free** (tidak perlu bayar Railway).

1. [render.com](https://render.com) → sign up free
2. **New → Blueprint** → connect repo → pakai `render.yaml`
3. Atau manual: **Web Service** → Docker → `Dockerfile.api` → **Free** plan
4. Variables → paste `env/vercel.api.env`
5. Copy URL Render → set di Vercel: `NEXT_PUBLIC_API_URL=https://xxx.onrender.com`

| | |
|---|---|
| ✅ Gratis | Free tier (sleep setelah 15 menit idle, cold start ~30–60 dtk) |
| ✅ No 10s limit | CVI sync on-chain lebih aman |
| ⚠️ Cold start | Request pertama setelah idle agak lama |

---

## Opsi D · VPS kamu ($0 extra kalau sudah punya VPS)

API + Indexer di VPS, frontend + Clerk tetap Vercel. **Paling recommended** kalau punya VPS — no timeout, indexer jalan 24/7.

→ [DEPLOY-VPS.md](./DEPLOY-VPS.md)

---

## Opsi C · Lokal demo ($0)

Untuk hackathon submission video:

```bash
pnpm sync:env
pnpm dev:api   # :4000
pnpm dev:web   # :3000
```

Judges buka repo + video; live URL opsional.

---

## Perbandingan cepat

| Platform | Biaya | Clerk | CVI sync | Setup |
|----------|-------|-------|----------|-------|
| **Vercel only** | $0 | ✅ | ⚠️ 10s limit | Copy env → redeploy |
| **Render free** | $0 | di Vercel | ✅ | +10 menit |
| **Railway** | Bayar | di Vercel | ✅ | — skip kalau no budget |
| **Lokal** | $0 | dev only | ✅ | untuk record video |

---

## Rekomendasi untuk kamu

Sudah deploy Vercel + Clerk → **Opsi A** dulu:

1. Paste secret API (`CLEANVERSE_*`, `DEPLOYER_PRIVATE_KEY`) ke Vercel
2. Jangan set `NEXT_PUBLIC_API_URL`
3. Redeploy
4. Test `/api/health` di browser: `https://YOUR-APP.vercel.app/api/health`

Kalau CVI sync timeout → **Opsi B Render free** sebagai backup.

---

## Railway (berbayar)

Lihat `Dockerfile.api` + `railway.api.toml` jika nanti mau upgrade.
