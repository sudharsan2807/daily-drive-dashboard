-- Add new columns for description, date range, and sort order
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS from_date text,
ADD COLUMN IF NOT EXISTS to_date text,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;