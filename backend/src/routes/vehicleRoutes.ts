import { Router } from 'express';
import {
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicleStatus,
  condemnVehicle,
} from '../controllers/vehicleController.js';

const router = Router();

router.get('/', getVehicles);
router.post('/', addVehicle);
router.get('/:id', getVehicleById);
router.patch('/:id/status', updateVehicleStatus);
router.post('/:id/condemn', condemnVehicle);

export default router;
