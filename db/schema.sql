CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    -- restricted to only those with @utdallas.edu emails
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@utdallas\.edu$'),
	username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    token_balance NUMERIC(16, 4) NOT NULL DEFAULT 500.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
	liquidity_parameter NUMERIC(12, 4) DEFAULT 100.0000, -- needed for LMSR
	winning_outcome_id INT, -- needed for LMSR
    start_time TIMESTAMP NOT NULL,
    category TEXT,
    resolution_source TEXT,
    end_time TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open, closed, resolved
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE market_outcomes (
    id SERIAL PRIMARY KEY,
    market_id INT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(20, 6) DEFAULT 0.000000, -- LMSR quantity tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- link the outcome back to the respective market
ALTER TABLE markets 
ADD CONSTRAINT fk_winning_outcome 
FOREIGN KEY (winning_outcome_id) REFERENCES market_outcomes(id);

-- used to store snapshots of prices over time
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    outcome_id INT NOT NULL REFERENCES market_outcomes(id) ON DELETE CASCADE,
    price NUMERIC(8, 6) NOT NULL, -- The probability/cost (0.0 to 1.0)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outcome_id INT NOT NULL REFERENCES market_outcomes(id) ON DELETE CASCADE,
    amount NUMERIC(16, 4) NOT NULL, -- what was paid to enter the bet
	payout_amount NUMERIC(16, 4) DEFAULT 0.0000, -- to track how much they earned from the bet
	is_settled BOOLEAN DEFAULT FALSE, -- to track P/L tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shares NUMERIC(20, 6) NOT NULL -- LMSR shares acquired
);

CREATE TABLE sells (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outcome_id INT NOT NULL REFERENCES market_outcomes(id) ON DELETE CASCADE,
    shares NUMERIC(20, 6) NOT NULL, -- LMSR shares (matches bets.shares precision)
    tokens_received NUMERIC(16, 4) NOT NULL, -- Tokens received from sale (supports fractional amounts)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(16, 4) NOT NULL,
    reason TEXT NOT NULL, -- e.g., "initial tokens", "bet placed", "bet won"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    market_id INT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Idempotency table for preventing duplicate requests (e.g., duplicate bets on network retry)
CREATE TABLE idempotency_keys (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL,
    request_path TEXT NOT NULL, -- /api/bets, /api/bets/sell, etc.
    response_status INT,
    response_body JSONB, -- Store the response to return on retry
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, idempotency_key, request_path)
);

-- ────────────────────────────────────────────────────────────────────────────────
-- PRODUCTION INDEXES FOR PERFORMANCE
-- ────────────────────────────────────────────────────────────────────────────────

-- User queries
CREATE INDEX idx_users_id ON users(id);

-- Bet queries
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_outcome_id ON bets(outcome_id);

-- Market outcome queries (frequently joined with markets)
CREATE INDEX idx_market_outcomes_market_id ON market_outcomes(market_id);

-- Price history queries (time-series lookups and aggregations)
CREATE INDEX idx_price_history_outcome_id ON price_history(outcome_id);
CREATE INDEX idx_price_history_created_at ON price_history(created_at DESC);

-- Market queries (filtering by status, recent markets)
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_created_at ON markets(created_at DESC);

-- Sell queries
CREATE INDEX idx_sells_user_id ON sells(user_id);
CREATE INDEX idx_sells_outcome_id ON sells(outcome_id);

-- Transaction queries (audit trail, user-specific)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Idempotency lookups
CREATE INDEX idx_idempotency_keys_user_id ON idempotency_keys(user_id);
CREATE INDEX idx_idempotency_keys_created_at ON idempotency_keys(created_at DESC);