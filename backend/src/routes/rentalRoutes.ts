import { Router } from 'express';
import {
  getRentals,
  getRentalById,
  getMyBookings,
  calculateQuote,
  createBooking,
  dispatchVehicle,
  returnAndSettleVehicle,
} from '../controllers/rentalController.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Customer / Public routes
router.post('/quote', calculateQuote);
router.post('/book', optionalAuthenticate, createBooking);
router.get('/my-bookings', authenticate, getMyBookings);

// Admin-restricted fleet dispatch & settlement routes
router.get('/', authenticate, requireRole(['ADMIN']), getRentals);
router.get('/:id', authenticate, getRentalById);
router.post('/:id/dispatch', authenticate, requireRole(['ADMIN']), dispatchVehicle);
router.post('/:id/return', authenticate, requireRole(['ADMIN']), returnAndSettleVehicle);

export default router;
