-- Sell shares back to the market (LMSR). Position = SUM(bets.shares) - SUM(sells.shares).

CREATE TABLE IF NOT EXISTS sells (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outcome_id INT NOT NULL REFERENCES market_outcomes(id) ON DELETE CASCADE,
    shares FLOAT NOT NULL,
    tokens_received INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sells_user_outcome ON sells (user_id, outcome_id);

COMMENT ON TABLE sells IS 'LMSR: records of shares sold back to the market maker';
