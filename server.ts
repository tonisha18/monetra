import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import userRoutes from './backend/routes/userRoutes.js';
import transactionRoutes from './backend/routes/transactionRoutes.js';
import dashboardRoutes from './backend/routes/dashboardRoutes.js';
import authRoutes from './backend/routes/authRoutes.js';
import aiRoutes from './backend/routes/aiRoutes.js';
import { isSupabaseConfigured } from './backend/config/supabase.js';

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health and System Status API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/config/status', (req, res) => {
    const configured = isSupabaseConfigured();
    res.json({
      supabaseConfigured: configured,
      message: configured
        ? 'Supabase backend connected successfully'
        : 'Supabase credentials not detected. Operating in demo/setup mode.',
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/ai', aiRoutes);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Financial Tracker Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
