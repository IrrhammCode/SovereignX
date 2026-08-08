import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { apiRouter } from './routes/api.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

app.listen(config.port, () => {
  console.log(`[SovereignX API] listening on :${config.port}`);
});
