import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Auth middleware - Headers:', req.headers.authorization ? 'Token present' : 'No token');
    
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Auth middleware - No token provided');
      throw createError('No token, authorization denied', 401);
    }

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    console.log('Auth middleware - Supabase response:', { user: user?.id, error });

    if (error || !user) {
      console.log('Auth middleware - Token invalid:', error?.message);
      throw createError('Token is not valid', 401);
    }

    req.user = {
      id: user.id,
      email: user.email || '',
    };
    
    console.log('Auth middleware - Success, user:', req.user.id);
    next();
  } catch (error) {
    console.log('Auth middleware - Error:', error);
    next(createError('Token is not valid', 401));
  }
};