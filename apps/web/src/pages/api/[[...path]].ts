import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiApp } from '@sovereignx/api/app';

/** Mount SovereignX Express API on Vercel (free — same project as Clerk frontend) */
const app = createApiApp();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return app(req, res);
}

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};
