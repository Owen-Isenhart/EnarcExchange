-- Add created_by to markets if missing (required by GET /api/markets and GET /api/markets/:id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'markets' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE markets ADD COLUMN created_by INT;
    -- Backfill: set to first user so existing rows are valid
    UPDATE markets SET created_by = (SELECT id FROM users ORDER BY id LIMIT 1) WHERE created_by IS NULL;
    ALTER TABLE markets ALTER COLUMN created_by SET NOT NULL;
    ALTER TABLE markets ADD CONSTRAINT fk_markets_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;
END $$;
