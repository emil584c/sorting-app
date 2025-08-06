import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '@/controllers/categories';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export { router as categoryRoutes };