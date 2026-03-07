-- Migration 005: Fix schema precision and add production indexes
-- 1. Fix sells table to use NUMERIC instead of INT/FLOAT
-- 2. Add critical indexes for query performance

-- Fix sells.tokens_received to support fractional token payouts from LMSR
ALTER TABLE sells ALTER COLUMN tokens_received SET DATA TYPE NUMERIC(16, 4);

-- Fix sells.shares to use precise NUMERIC instead of imprecise FLOAT
ALTER TABLE sells ALTER COLUMN shares SET DATA TYPE NUMERIC(20, 6);

-- Create critical indexes for production performance
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_outcome_id ON bets(outcome_id);
CREATE INDEX IF NOT EXISTS idx_market_outcomes_market_id ON market_outcomes(market_id);
CREATE INDEX IF NOT EXISTS idx_price_history_outcome_id ON price_history(outcome_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_created_at ON markets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sells_user_id ON sells(user_id);
CREATE INDEX IF NOT EXISTS idx_sells_outcome_id ON sells(outcome_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
