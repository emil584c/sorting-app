import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { categorySchema } from '@/utils/validation';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Create category request body:', req.body);
    console.log('User ID:', req.user?.id);
    
    const validatedData = categorySchema.parse(req.body);
    const userId = req.user!.id;

    console.log('Validated data:', validatedData);

    // Check if category name already exists for this user
    const { data: existingCategory, error: checkError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', validatedData.name)
      .maybeSingle();

    console.log('Existing category check:', { existingCategory, checkError });

    if (existingCategory) {
      throw createError('Category with this name already exists', 400);
    }

    // Create category
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert({
        ...validatedData,
        user_id: userId,
      })
      .select()
      .single();

    console.log('Insert result:', { category, error });

    if (error) {
      console.error('Database error:', error);
      throw createError(`Failed to create category: ${error.message}`, 500);
    }

    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error('Category creation error:', error);
    next(error);
  }
};

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select(`
        *,
        items(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      throw createError('Failed to fetch categories', 500);
    }

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .select(`
        *,
        items(count)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !category) {
      throw createError('Category not found', 404);
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const validatedData = categorySchema.partial().parse(req.body);

    // Check if category exists and belongs to user
    const { data: existingCategory } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingCategory) {
      throw createError('Category not found', 404);
    }

    // Check for name conflicts if name is being updated
    if (validatedData.name) {
      const { data: nameConflict } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', validatedData.name)
        .neq('id', id)
        .single();

      if (nameConflict) {
        throw createError('Category with this name already exists', 400);
      }
    }

    // Update category
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw createError('Failed to update category', 500);
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if category exists and belongs to user
    const { data: existingCategory } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingCategory) {
      throw createError('Category not found', 404);
    }

    // Delete category (items will be cascade deleted)
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      throw createError('Failed to delete category', 500);
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};