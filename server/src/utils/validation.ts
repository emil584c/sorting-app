import { z } from 'zod';
import { FieldType } from '@/types/database';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const fieldConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['text', 'textarea', 'boolean', 'number', 'date', 'image', 'select', 'tags', 'quantity']),
  required: z.boolean().default(false),
  options: z.object({
    placeholder: z.string().optional(),
    defaultValue: z.any().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    unit: z.string().optional(),
    options: z.array(z.string()).optional(),
    multiple: z.boolean().optional(),
  }).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  field_config: z.array(fieldConfigSchema),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().max(50, 'Icon name too long').optional(),
});

export const itemSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Item name is required').max(255, 'Item name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  field_data: z.record(z.any()),
  images: z.array(z.string()).optional(),
});

export const validateFieldData = (fieldData: Record<string, any>, fieldConfig: any[]) => {
  const errors: Record<string, string> = {};

  for (const field of fieldConfig) {
    const value = fieldData[field.id];
    
    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.id] = `${field.name} is required`;
      continue;
    }

    // Skip validation for optional empty fields
    if (!value && !field.required) continue;

    // Type-specific validation
    switch (field.type) {
      case 'number':
      case 'quantity':
        if (isNaN(Number(value))) {
          errors[field.id] = `${field.name} must be a number`;
        } else {
          const num = Number(value);
          if (field.options?.min !== undefined && num < field.options.min) {
            errors[field.id] = `${field.name} must be at least ${field.options.min}`;
          }
          if (field.options?.max !== undefined && num > field.options.max) {
            errors[field.id] = `${field.name} must be at most ${field.options.max}`;
          }
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors[field.id] = `${field.name} must be true or false`;
        }
        break;
      case 'date':
        if (!Date.parse(value)) {
          errors[field.id] = `${field.name} must be a valid date`;
        }
        break;
      case 'select':
        if (field.options?.options && !field.options.options.includes(value)) {
          errors[field.id] = `${field.name} must be one of: ${field.options.options.join(', ')}`;
        }
        break;
      case 'tags':
        if (!Array.isArray(value)) {
          errors[field.id] = `${field.name} must be an array`;
        }
        break;
      case 'image':
        if (field.options?.multiple && !Array.isArray(value)) {
          errors[field.id] = `${field.name} must be an array for multiple images`;
        }
        break;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};