-- Add 'floating' as a valid task type
-- Add except_days column for daily tasks to exclude certain days
-- Add postponed_from column to track original date for particular tasks

-- Note: type is already text, so no schema change needed
-- We just need to add new columns for additional features

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS except_days integer[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS postponed_from text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS day_count integer DEFAULT 0;