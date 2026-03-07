-- LMSR: track shares outstanding per outcome and shares per bet
-- Run this on existing databases; schema.sql already includes these for new installs.

ALTER TABLE market_outcomes
ADD COLUMN IF NOT EXISTS quantity FLOAT NOT NULL DEFAULT 0;

ALTER TABLE bets
ADD COLUMN IF NOT EXISTS shares FLOAT NOT NULL DEFAULT 0;

COMMENT ON COLUMN market_outcomes.quantity IS 'LMSR: net shares sold by market maker for this outcome (q_i)';
COMMENT ON COLUMN bets.shares IS 'LMSR: number of outcome shares bought in this bet';
