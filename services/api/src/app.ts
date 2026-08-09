import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { apiRouter } from './routes/api.js';

/** Express app — used by standalone server and Vercel serverless handler */
export function createApiApp() {
  const app = express();

  const corsOrigin =
    config.corsOrigins.length === 1 && config.corsOrigins[0] === '*'
      ? true
      : config.corsOrigins;

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());
  app.use('/api', apiRouter);

  return app;
}
