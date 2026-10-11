import { Router, Request, Response } from 'express';
import logRoutes from './logRoutes';
import projectRoutes from './projectRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CommitLog API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
router.use('/logs', logRoutes);
router.use('/projects', projectRoutes);

export default router;
