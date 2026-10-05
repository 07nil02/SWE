import { Router } from 'express';
import { getFleetStatistics } from '../controllers/analyticsController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Admin-only business intelligence analytics
router.get('/fleet-stats', authenticate, requireRole(['ADMIN']), getFleetStatistics);

export default router;
