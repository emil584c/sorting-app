import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { itemSchema, validateFieldData } from '@/utils/validation';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export const createItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = itemSchema.parse(req.body);
    const userId = req.user!.id;

    // Verify category exists and belongs to user
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('field_config')
      .eq('id', validatedData.category_id)
      .eq('user_id', userId)
      .single();

    if (categoryError || !category) {
      throw createError('Category not found', 404);
    }

    // Validate field data against category schema
    const { isValid, errors } = validateFieldData(validatedData.field_data, category.field_config);
    if (!isValid) {
      throw createError(`Field validation failed: ${Object.values(errors).join(', ')}`, 400);
    }

    // Create item
    const { data: item, error } = await supabaseAdmin
      .from('items')
      .insert({
        ...validatedData,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw createError('Failed to create item', 500);
    }

    res.status(201).json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { category_id, search, page = '1', limit = '10' } = req.query;

    let query = supabaseAdmin
      .from('items')
      .select(`
        *,
        categories!inner(name, field_config)
      `)
      .eq('user_id', userId);

    // Filter by category if provided
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    // Search functionality
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: items, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      throw createError('Failed to fetch items', 500);
    }

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: item, error } = await supabaseAdmin
      .from('items')
      .select(`
        *,
        categories!inner(name, field_config)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !item) {
      throw createError('Item not found', 404);
    }

    res.json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const validatedData = itemSchema.partial().parse(req.body);

    // Check if item exists and belongs to user
    const { data: existingItem, error: existingError } = await supabaseAdmin
      .from('items')
      .select('category_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (existingError || !existingItem) {
      throw createError('Item not found', 404);
    }

    // If field_data is being updated, validate against category schema
    if (validatedData.field_data) {
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('field_config')
        .eq('id', existingItem.category_id)
        .eq('user_id', userId)
        .single();

      if (category) {
        const { isValid, errors } = validateFieldData(validatedData.field_data, category.field_config);
        if (!isValid) {
          throw createError(`Field validation failed: ${Object.values(errors).join(', ')}`, 400);
        }
      }
    }

    // Update item
    const { data: item, error } = await supabaseAdmin
      .from('items')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw createError('Failed to update item', 500);
    }

    res.json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if item exists and belongs to user
    const { data: existingItem } = await supabaseAdmin
      .from('items')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingItem) {
      throw createError('Item not found', 404);
    }

    // Delete item
    const { error } = await supabaseAdmin
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      throw createError('Failed to delete item', 500);
    }

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { itemIds, updates } = req.body;
    const userId = req.user!.id;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      throw createError('Item IDs are required', 400);
    }

    // Verify all items belong to user
    const { data: items, error: fetchError } = await supabaseAdmin
      .from('items')
      .select('id')
      .eq('user_id', userId)
      .in('id', itemIds);

    if (fetchError || !items || items.length !== itemIds.length) {
      throw createError('Some items not found or access denied', 404);
    }

    // Perform bulk update
    const { data: updatedItems, error } = await supabaseAdmin
      .from('items')
      .update(updates)
      .eq('user_id', userId)
      .in('id', itemIds)
      .select();

    if (error) {
      console.error('Database error:', error);
      throw createError('Failed to update items', 500);
    }

    res.json({
      success: true,
      data: { items: updatedItems },
      message: `${updatedItems?.length || 0} items updated successfully`,
    });
  } catch (error) {
    next(error);
  }
};