-- Add is_admin column if missing (e.g. older schema or manual create)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
