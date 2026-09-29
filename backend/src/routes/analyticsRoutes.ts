import { Router } from 'express';
import { getFleetStatistics } from '../controllers/analyticsController.js';

const router = Router();

router.get('/fleet-stats', getFleetStatistics);

export default router;
