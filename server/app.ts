import express from 'express';
import { apiRouter } from './api.ts';

export const app = express();

app.use(express.json());
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
