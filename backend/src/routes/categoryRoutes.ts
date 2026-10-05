import { Router } from 'express';
import { getAllCategories, updateCategoryRates } from '../controllers/categoryController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public rate card viewing
router.get('/', getAllCategories);

// Admin-only rate adjustments
router.put('/:id', authenticate, requireRole(['ADMIN']), updateCategoryRates);

export default router;
