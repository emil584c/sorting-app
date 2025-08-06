import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  bulkUpdateItems,
} from '@/controllers/items';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createItem);
router.get('/', getItems);
router.get('/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.patch('/bulk', bulkUpdateItems);

export { router as itemRoutes };