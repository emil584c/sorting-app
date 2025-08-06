-- Fix foreign key constraints to reference auth.users instead of public.users

-- Drop existing foreign key constraints
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_user_id_fkey;

-- Add correct foreign key constraints referencing auth.users
ALTER TABLE public.categories 
ADD CONSTRAINT categories_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.items 
ADD CONSTRAINT items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;