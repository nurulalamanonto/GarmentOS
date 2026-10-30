import { Router } from 'express';
import healthRoutes from './health.routes.js';

// All API routes are mounted here under /api.
// Later stages add: orders, production, materials, quality, shipments, dashboard, risks.
const router = Router();

router.use('/health', healthRoutes);

export default router;
