import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { registerSchema, loginSchema } from '@/utils/validation';
import { createError } from '@/middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password } = validatedData;

    // Create user with Supabase Auth using admin client
    // We use admin.createUser with email_confirm: true to bypass email verification
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email to skip verification step
    });

    if (error) {
      // Handle different error types
      if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
        throw createError('User already exists with this email', 400);
      }
      console.error('Supabase Auth error:', error);
      throw createError(error.message || 'Failed to create user', 400);
    }

    if (!data.user) {
      throw createError('Failed to create user', 500);
    }

    // Now sign them in to get a session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Auto sign-in error:', signInError);
      // User was created but sign-in failed - still return success
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            created_at: data.user.created_at,
          },
        },
        message: 'User created successfully. Please sign in to continue.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        access_token: signInData.session?.access_token,
        refresh_token: signInData.session?.refresh_token,
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
          created_at: signInData.user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Sign in with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw createError('Invalid credentials', 401);
    }

    res.json({
      success: true,
      data: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    // Get user from Supabase Auth
    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: { 
        user: {
          id: user.user.id,
          email: user.user.email,
          created_at: user.user.created_at,
          updated_at: user.user.updated_at,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};