import express from 'express';
import path from 'path';
import fs from 'fs';

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = '0.0.0.0';

  app.use(express.json());

  // Cloud Run / Kubernetes Health Check endpoints
  app.get('/healthz', (_req, res) => {
    res.status(200).send('OK');
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  });

  const distPath = path.resolve(import.meta.dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(distPath, 'index.html'));

  if (isProd) {
    // Serve production static assets from dist
    app.use(express.static(distPath, { maxAge: '1d', index: false }));

    // Client-side SPA routing fallback: send index.html for all non-static GET routes
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development mode fallback
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(port, host, () => {
    console.log(`[Waqti Server] Listening on http://${host}:${port} (${isProd ? 'production' : 'development'})`);
  });

  // Graceful shutdown handling for Cloud Run container lifecycle
  const handleShutdown = (signal: string) => {
    console.log(`[Waqti Server] Received ${signal}, closing server gracefully...`);
    server.close(() => {
      console.log('[Waqti Server] Server closed successfully');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[Waqti Server] Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[Waqti Server] Failed to start:', err);
  process.exit(1);
});
