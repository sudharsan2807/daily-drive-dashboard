-- Add interval_days column for gap days scheduling
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS interval_days integer DEFAULT 1;

-- Add skipped_dates column for single-day task removal
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS skipped_dates text[] DEFAULT '{}'::text[];