/** PM2 config for VPS deploy (no Docker) — run: pm2 start ecosystem.vps.config.cjs */
module.exports = {
  apps: [
    {
      name: 'sovereignx-api',
      cwd: './services/api',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: '4000',
      },
    },
    {
      name: 'sovereignx-indexer',
      cwd: './services/indexer',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: '4001',
      },
    },
  ],
};
