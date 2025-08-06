import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/config/supabase';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(createError('Only image files are allowed', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      throw createError('No file uploaded', 400);
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Storage error:', error);
      throw createError('Failed to upload image', 500);
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName);

    res.json({
      success: true,
      data: {
        url: publicUrlData.publicUrl,
        path: fileName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleImages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw createError('No files uploaded', 400);
    }

    const uploadPromises = files.map(async (file) => {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from('images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(fileName);

      return {
        url: publicUrlData.publicUrl,
        path: fileName,
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        images: results,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { path } = req.params;

    // Verify the path belongs to the user
    if (!path.startsWith(userId)) {
      throw createError('Access denied', 403);
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('images')
      .remove([path]);

    if (error) {
      console.error('Storage error:', error);
      throw createError('Failed to delete image', 500);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};