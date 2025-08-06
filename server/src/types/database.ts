export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
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
  options?: string[]; // For select fields
  multiple?: boolean; // For image and select fields
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      items: {
        Row: Item;
        Insert: Omit<Item, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Item, 'id' | 'created_at'>>;
      };
    };
  };
}