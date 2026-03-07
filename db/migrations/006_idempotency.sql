-- Migration 006: Add idempotency support for bets and transactions
-- Prevents duplicate requests from creating duplicate bets/sells when retrying

CREATE TABLE IF NOT EXISTS idempotency_keys (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL,
    request_path TEXT NOT NULL, -- /api/bets, /api/bets/sell, etc.
    response_status INT,
    response_body JSONB, -- Store the response to return on retry
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, idempotency_key, request_path)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_user_id ON idempotency_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_created_at ON idempotency_keys(created_at DESC);

-- Clean up old idempotency records after 24 hours (can be run periodically)
-- For now, just document the intention. In production, use a CRON job or app logic.
