import { Router } from 'express';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// GET /api/health - lets the frontend (and hosting platforms) check the API is alive.
router.get('/', (req, res) => {
  const data = {
    service: 'GarmentOS API',
    status: 'ok',
    timestamp: new Date().toISOString(),
    storage: 'demo-data', // becomes "postgresql" in Stage 7
  };
  sendSuccess(res, data, 'API is running');
});

export default router;
