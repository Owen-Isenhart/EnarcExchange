CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    -- restricted to only those with @utdallas.edu emails
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@utdallas\.edu$'),
	username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    token_balance NUMERIC(16, 4) NOT NULL DEFAULT 500.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
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
    total_shares_outstanding NUMERIC(20, 6) DEFAULT 0.000000,
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
    shares_acquired NUMERIC(20, 6) NOT NULL
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