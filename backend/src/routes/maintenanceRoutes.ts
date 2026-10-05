import { Router } from 'express';
import {
  getMaintenanceLogs,
  createMaintenanceLog,
  getFuelLogs,
  createFuelLog,
} from '../controllers/maintenanceController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Admin-only maintenance and fuel logging
router.use(authenticate, requireRole(['ADMIN']));

router.get('/maintenance', getMaintenanceLogs);
router.post('/maintenance', createMaintenanceLog);
router.get('/fuel', getFuelLogs);
router.post('/fuel', createFuelLog);

export default router;
