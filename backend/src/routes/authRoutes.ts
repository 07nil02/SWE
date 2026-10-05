import { Router } from 'express';
import { register, login, getCurrentUser, demoLogin } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', authenticate, getCurrentUser);

export default router;
