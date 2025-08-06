import { Router } from 'express';
import { upload, uploadImage, uploadMultipleImages, deleteImage } from '@/controllers/upload';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/single', upload.single('image'), uploadImage);
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);
router.delete('/:path', deleteImage);

export { router as uploadRoutes };