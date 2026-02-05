-- 1. CLEANUP 
TRUNCATE messages, transactions, bets, price_history, market_outcomes, markets, users CASCADE;

-- 2. USERS (UTD Students & Staff)
-- Note: password_hash is just a placeholder string for now
INSERT INTO users (email, username, password_hash, token_balance) VALUES
('temoc@utdallas.edu', 'TemocOfficial', 'hash123', 1000),
('enarc@utdallas.edu', 'CraneMaster', 'hash123', 500),
('tobias@utdallas.edu', 'TobiasTheCat', 'hash123', 750),
('student1@utdallas.edu', 'CometTrader', 'hash123', 400),
('student2@utdallas.edu', 'NorthsideNightmare', 'hash123', 500);

-- 3. MARKETS
-- Market 1: Academics (Active)
INSERT INTO markets (id, name, description, start_time, end_time, status, liquidity_parameter)
VALUES (1, 'Average CS 1337 Grade', 'Will the average grade for all CS 1337 sections be an A- or higher?', NOW(), NOW() + INTERVAL '30 days', 'open', 100.0);

-- Market 2: Campus Life (Active)
INSERT INTO markets (id, name, description, start_time, end_time, status, liquidity_parameter)
VALUES (2, 'Student Union Construction', 'Will the SU expansion be completed by the start of Fall 2026?', NOW(), '2026-08-01 00:00:00', 'open', 150.0);

-- Market 3: Dining (Resolved - for testing P/L)
INSERT INTO markets (id, name, description, start_time, end_time, status, liquidity_parameter)
VALUES (3, 'Dining Hall West: Taco Tuesday', 'Will DHW serve street tacos this coming Tuesday?', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 'resolved', 100.0);

-- 4. MARKET OUTCOMES
-- Outcomes for Market 1
INSERT INTO market_outcomes (id, market_id, description) VALUES
(1, 1, 'Yes - Average is >= 3.67 GPA'),
(2, 1, 'No - Average is < 3.67 GPA');

-- Outcomes for Market 2
INSERT INTO market_outcomes (id, market_id, description) VALUES
(3, 2, 'Yes - Construction finished'),
(4, 2, 'No - Still under construction');

-- Outcomes for Market 3
INSERT INTO market_outcomes (id, market_id, description) VALUES
(5, 3, 'Yes - Tacos served'),
(6, 3, 'No - No tacos');

-- 5. RESOLVE THE TACO MARKET (Set the winner)
UPDATE markets SET winning_outcome_id = 5 WHERE id = 3;

-- 6. PRICE HISTORY (Initial snapshots)
INSERT INTO price_history (outcome_id, price) VALUES
(1, 0.55), (2, 0.45), -- CS grade leans Yes
(3, 0.20), (4, 0.80), -- Construction leans No (classic UTD)
(5, 1.00), (6, 0.00); -- Resolved market prices

-- 7. BETS
-- Active bet for CometTrader
INSERT INTO bets (user_id, outcome_id, amount, is_settled) 
VALUES (4, 1, 50, FALSE);

-- Resolved bet for Temoc (He won!)
INSERT INTO bets (user_id, outcome_id, amount, payout_amount, is_settled) 
VALUES (1, 5, 100, 200, TRUE);

-- 8. TRANSACTIONS
INSERT INTO transactions (user_id, amount, reason) VALUES
(1, 500, 'initial tokens'),
(1, -100, 'bet placed'),
(1, 200, 'bet won'),
(4, 500, 'initial tokens'),
(4, -50, 'bet placed');

-- 9. MESSAGES (Live Chat Feed)
INSERT INTO messages (user_id, market_id, content) VALUES
(1, 1, 'I think the curve will be huge this year.'),
(2, 2, 'Never bet on UTD construction finishing early...'),
(4, 1, 'Does anyone have the syllabus for Smith?');