import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, '..', 'assets');

export function createApp() {
  const app = express();

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '1mb' }));
  app.use('/media', express.static(assetsDir));

  app.get('/', (req, res) => {
    res.json({
      ok: true,
      message: 'RoyalSalon backend is running',
    });
  });

  app.use('/api', apiRoutes);

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: error.message || 'Unexpected server error',
    });
  });

  return app;
}
