export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  field_config: FieldConfig[];
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  items?: { count: number }[];
}

export interface Item {
  id: string;
  category_id: string;
  user_id: string;
  name: string;
  description?: string;
  field_data: Record<string, any>;
  images?: string[];
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    field_config: FieldConfig[];
  };
}

export interface FieldConfig {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: FieldOptions;
}

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'boolean'
  | 'number'
  | 'date'
  | 'image'
  | 'select'
  | 'tags'
  | 'quantity';

export interface FieldOptions {
  placeholder?: string;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: string[];
  multiple?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}