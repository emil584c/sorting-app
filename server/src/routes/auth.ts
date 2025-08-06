import { Router } from 'express';
import { register, login, getProfile } from '@/controllers/auth';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export { router as authRoutes };