
-- 2. USERS (UTD Students & Staff)
-- Updated token_balance to match the transaction math below
INSERT INTO users (id, email, username, password_hash, token_balance) VALUES
(1, 'temoc@utdallas.edu', 'TemocOfficial', 'hash123', 600),   -- 500 init - 100 bet + 200 win
(2, 'enarc@utdallas.edu', 'CraneMaster', 'hash123', 500),    -- 500 init
(3, 'tobias@utdallas.edu', 'TobiasTheCat', 'hash123', 750),  -- 750 init
(4, 'student1@utdallas.edu', 'CometTrader', 'hash123', 450), -- 500 init - 50 bet
(5, 'student2@utdallas.edu', 'NorthsideNightmare', 'hash123', 500);

-- Reset serial sequences so IDs stay predictable for seeding
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. MARKETS
INSERT INTO markets (id, created_by, name, description, start_time, end_time, status, liquidity_parameter)
VALUES 
(1, 2, 'Average CS 1337 Grade', 'Will the average grade for all CS 1337 sections be an A- or higher?', NOW(), NOW() + INTERVAL '30 days', 'open', 100.0),
(2, 1, 'Student Union Construction', 'Will the SU expansion be completed by the start of Fall 2026?', NOW(), '2026-08-01 00:00:00', 'open', 150.0),
(3, 3, 'Dining Hall West: Taco Tuesday', 'Will DHW serve street tacos this coming Tuesday?', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 'resolved', 100.0);

SELECT setval('markets_id_seq', (SELECT MAX(id) FROM markets));

-- 4. MARKET OUTCOMES
INSERT INTO market_outcomes (id, market_id, description) VALUES
(1, 1, 'Yes - Average is >= 3.67 GPA'),
(2, 1, 'No - Average is < 3.67 GPA'),
(3, 2, 'Yes - Construction finished'),
(4, 2, 'No - Still under construction'),
(5, 3, 'Yes - Tacos served'),
(6, 3, 'No - No tacos');

SELECT setval('market_outcomes_id_seq', (SELECT MAX(id) FROM market_outcomes));

-- 5. RESOLVE THE TACO MARKET (Post-outcome insertion)
UPDATE markets SET winning_outcome_id = 5 WHERE id = 3;

-- 6. PRICE HISTORY (Tracking snapshots)
INSERT INTO price_history (outcome_id, price) VALUES
(1, 0.55), (2, 0.45), -- CS grade leans Yes
(3, 0.20), (4, 0.80), -- Construction leans No (classic UTD)
(5, 1.00), (6, 0.00); -- Resolved market prices (Winner = 1.0)

-- 7. BETS
INSERT INTO bets (user_id, outcome_id, amount, payout_amount, is_settled) VALUES 
(4, 1, 50, 0, FALSE),       -- CometTrader active bet
(1, 5, 100, 200, TRUE);     -- Temoc won 200 on Tacos

-- 8. TRANSACTIONS (Audit log for token_balance)
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