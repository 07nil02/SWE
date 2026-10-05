import { Router } from 'express';
import {
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicleStatus,
  condemnVehicle,
} from '../controllers/vehicleController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public catalogue inspection
router.get('/', getVehicles);
router.get('/:id', getVehicleById);

// Admin-only fleet inventory modifications
router.post('/', authenticate, requireRole(['ADMIN']), addVehicle);
router.patch('/:id/status', authenticate, requireRole(['ADMIN']), updateVehicleStatus);
router.post('/:id/condemn', authenticate, requireRole(['ADMIN']), condemnVehicle);

export default router;
