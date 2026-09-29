import { Router } from 'express';
import {
  getMaintenanceLogs,
  createMaintenanceLog,
  getFuelLogs,
  createFuelLog,
} from '../controllers/maintenanceController.js';

const router = Router();

router.get('/maintenance', getMaintenanceLogs);
router.post('/maintenance', createMaintenanceLog);
router.get('/fuel', getFuelLogs);
router.post('/fuel', createFuelLog);

export default router;
