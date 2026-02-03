CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    -- restricted to only those with @utdallas.edu emails
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@utdallas\.edu$'),
	username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    token_balance INTEGER NOT NULL DEFAULT 500,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
	liquidity_parameter FLOAT DEFAULT 100.0, -- needed for LMSR
	winning_outcome_id INT, -- needed for LMSR
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open, closed, resolved
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE market_outcomes (
    id SERIAL PRIMARY KEY,
    market_id INT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
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
    price FLOAT NOT NULL, -- The probability/cost (0.0 to 1.0)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outcome_id INT NOT NULL REFERENCES market_outcomes(id) ON DELETE CASCADE,
    amount INT NOT NULL, -- what was paid to enter the bet
	payout_amount INT DEFAULT 0, -- to track how much they earned from the bet
	is_settled BOOLEAN DEFAULT FALSE, -- to track P/L tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    reason TEXT NOT NULL, -- e.g., "initial tokens", "bet placed", "bet won"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    market_id INT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);