# Deploy API ke VPS

Frontend + Clerk tetap di **Vercel**. API + Indexer jalan di **VPS** kamu.

```
Browser → Vercel (Next.js + Clerk)
              ↓
         VPS :4000 (API) → Cleanverse + Monad
         VPS :4001 (Indexer, opsional)
```

---

## Persyaratan VPS

- Ubuntu 22/24 atau Debian (recommended)
- Node.js ≥ 18 **atau** Docker
- Port **4000** (API) terbuka — ideally lewat Nginx + HTTPS
- Min ~512 MB RAM (1 GB lebih nyaman)

---

## Opsi 1 · Docker (paling gampang)

### 1. SSH ke VPS

```bash
ssh user@YOUR_VPS_IP
```

### 2. Clone repo

```bash
git clone https://github.com/IrrhammCode/SovereignX.git
cd SovereignX
```

### 3. Buat file env di VPS

Dari **laptop lokal**:

```bash
pnpm generate:vercel-api-env
scp env/vercel.api.env user@YOUR_VPS_IP:~/SovereignX/.env.api
```

Di VPS, edit `.env.api`:

```bash
nano .env.api
```

Pastikan ada:

```env
ALLOWED_ORIGINS=https://YOUR-APP.vercel.app,http://localhost:3000
INDEXER_URL=http://indexer:4001
API_PORT=4000
```

(Ganti `YOUR-APP.vercel.app` dengan URL Vercel kamu.)

### 4. Jalankan dengan Docker Compose

```bash
docker compose -f docker-compose.vps.yml up -d --build
docker compose -f docker-compose.vps.yml ps
curl http://localhost:4000/api/health
```

### 5. Nginx + HTTPS (recommended)

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

Buat `/etc/nginx/sites-available/sovereignx-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sovereignx-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.yourdomain.com
```

Test: `https://api.yourdomain.com/api/health`

---

## Opsi 2 · PM2 (tanpa Docker)

```bash
# Di VPS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pnpm pm2

git clone https://github.com/IrrhammCode/SovereignX.git
cd SovereignX
pnpm install
pnpm --filter @sovereignx/shared build
pnpm --filter @sovereignx/api build
pnpm --filter @sovereignx/indexer build

# Copy env (dari scp .env.api → .env di root repo)
cp .env.api .env

pm2 start ecosystem.vps.config.cjs
pm2 save
pm2 startup   # ikuti instruksi agar auto-start setelah reboot
```

---

## Hubungkan ke Vercel

Di laptop:

```bash
pnpm generate:vercel-env --split https://api.yourdomain.com
# atau IP: http://YOUR_VPS_IP:4000 (kurang aman, no HTTPS)
```

Import / update di Vercel → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Redeploy Vercel → test dashboard enrollment.

---

## Firewall

```bash
# UFW — buka SSH + HTTP/HTTPS saja (Nginx proxy ke 4000 internal)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Kalau **tanpa Nginx**, buka port 4000:

```bash
sudo ufw allow 4000/tcp
```

---

## Update setelah push GitHub

**Docker:**

```bash
cd ~/SovereignX && git pull
docker compose -f docker-compose.vps.yml up -d --build
```

**PM2:**

```bash
cd ~/SovereignX && git pull && pnpm install
pnpm --filter @sovereignx/shared build
pnpm --filter @sovereignx/api build
pnpm --filter @sovereignx/indexer build
pm2 restart all
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| CORS error di browser | Set `ALLOWED_ORIGINS` = URL Vercel exact |
| API health OK, enrollment gagal | Cek `CLEANVERSE_API_ID` / `CLEANVERSE_API_KEY` di VPS |
| CVI sync gagal | Cek `DEPLOYER_PRIVATE_KEY` + saldo MON testnet |
| Indexer offline | `docker compose logs indexer` atau `pm2 logs sovereignx-indexer` |
| Vercel masih "API offline" | Redeploy Vercel setelah set `NEXT_PUBLIC_API_URL` |

---

## Keuntungan VPS vs Vercel embedded API

| | VPS | Vercel embedded |
|---|---|---|
| Biaya | VPS kamu sendiri | $0 |
| Timeout CVI sync | ✅ tidak ada limit 10 dtk | ⚠️ max 10 dtk |
| Indexer | ✅ bisa jalan 24/7 | ❌ |
| Setup | ~15 menit | ~5 menit |

**Rekomendasi:** VPS kamu → API di VPS, frontend tetap Vercel + Clerk.
