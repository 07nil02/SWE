import { Router } from 'express';
import {
  getRentals,
  getRentalById,
  calculateQuote,
  createBooking,
  dispatchVehicle,
  returnAndSettleVehicle,
} from '../controllers/rentalController.js';

const router = Router();

router.get('/', getRentals);
router.post('/quote', calculateQuote);
router.post('/book', createBooking);
router.get('/:id', getRentalById);
router.post('/:id/dispatch', dispatchVehicle);
router.post('/:id/return', returnAndSettleVehicle);

export default router;
