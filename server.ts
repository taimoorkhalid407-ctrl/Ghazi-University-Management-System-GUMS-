import express from 'express';
import path from 'path';
import { app } from './server/app.ts';

const PORT = Number(process.env.PORT) || 3000;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

// Serve static frontend assets from dist in production
app.use(express.static(DIST_DIR));

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  // If it's an api request that didn't match, return 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GUMS server running on http://0.0.0.0:${PORT}`);
});
