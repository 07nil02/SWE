import { Router } from 'express';
import { getAllCategories, updateCategoryRates } from '../controllers/categoryController.js';

const router = Router();

router.get('/', getAllCategories);
router.put('/:id', updateCategoryRates);

export default router;
