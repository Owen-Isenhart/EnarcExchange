-- ════════════════════════════════════════════════════════════════════════════════
-- ENARCEXCHANGE DEFINITIVE SEED DATA - UTD CS EDITION
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. CLEANUP & SEQUENCE RESET
-- Ensuring a completely fresh start for testing
TRUNCATE messages, idempotency_keys, transactions, sells, bets, price_history, market_outcomes, markets, users CASCADE;

ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE markets_id_seq RESTART WITH 1;
ALTER SEQUENCE market_outcomes_id_seq RESTART WITH 1;
ALTER SEQUENCE price_history_id_seq RESTART WITH 1;
ALTER SEQUENCE bets_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;

-- 2. CREATE USERS (100 Users)
-- Admin users (Guaranteed IDs 1 & 2)
INSERT INTO users (email, username, password_hash, token_balance, is_admin) VALUES
('temoc@utdallas.edu', 'TemocOfficial', '$2b$10$narc', 10000.0000, TRUE),
('enarc@utdallas.edu', 'CraneMaster', '$2b$10$narc', 10000.0000, TRUE);

-- Core student personas
INSERT INTO users (email, username, password_hash, token_balance) VALUES
('grinder@utdallas.edu', 'LeetCodeGrinder', '$2b$10$narc', 5000.0000),
('mazidi.fan@utdallas.edu', 'AssemblyAppreciator', '$2b$10$narc', 2500.0000),
('hack@utdallas.edu', 'HackathonVeteran', '$2b$10$narc', 3500.0000),
('discrete@utdallas.edu', 'TruthTableTerror', '$2b$10$narc', 1200.0000),
('linux@utdallas.edu', 'ArchUserBtw', '$2b$10$narc', 2000.0000);

-- Generate 93 more students to reach 100 total
INSERT INTO users (email, username, password_hash, token_balance) 
SELECT 
    'user' || i || '@utdallas.edu', 
    'Trader' || i, 
    '$2b$10$narc', 
    (500 + random() * 2000) 
FROM generate_series(8, 100) i;

-- 3. CREATE MARKETS (45+ Markets)
-- Dynamic lookup for creators to avoid ID 23503 errors
DO $$
DECLARE
    temoc_id INT := (SELECT id FROM users WHERE username = 'TemocOfficial');
    enarc_id INT := (SELECT id FROM users WHERE username = 'CraneMaster');
BEGIN

-- ACADEMICS
INSERT INTO markets (name, description, created_by, start_time, end_time, status, category, liquidity_parameter, resolution_source) VALUES
('MATH 2418 Avg Grade A-', 'Will the average grade for all MATH 2418 sections be A- or higher?', temoc_id, NOW() - INTERVAL '14 days', NOW() + INTERVAL '60 days', 'open', 'academics', 150.0, 'registrar'),
('CS 3345 Final Median > 80%', 'Will the median score on the Data Structures final exam be above 80%?', enarc_id, NOW() - INTERVAL '10 days', NOW() + INTERVAL '45 days', 'open', 'academics', 120.0, 'department_stats'),
('CS 4348 OS Curve > 5pts', 'Will Operating Systems have a curve greater than 5 points this semester?', temoc_id, NOW() - INTERVAL '7 days', NOW() + INTERVAL '50 days', 'open', 'academics', 100.0, 'syllabus'),
('CS 2305 Pass Rate > 85%', 'Will the pass rate for Discrete Mathematics 1 exceed 85% this term?', enarc_id, NOW() - INTERVAL '20 days', NOW() + INTERVAL '40 days', 'open', 'academics', 140.0, 'registrar'),
('CS 3377 Systems Programming Avg', 'Average grade for CS 3377 at end of semester A- or greater?', temoc_id, NOW() - INTERVAL '5 days', NOW() + INTERVAL '55 days', 'open', 'academics', 110.0, 'registrar'),
('CS 4349 Algorithms Midterm Avg', 'Will the median score of the first Algorithms midterm be below 65%?', temoc_id, NOW() - INTERVAL '2 days', NOW() + INTERVAL '20 days', 'open', 'academics', 130.0, 'eLearning'),
('CS 4485 Capstone A Rate', 'Will more than 95% of Senior Capstone teams receive an A?', enarc_id, NOW() - INTERVAL '30 days', NOW() + INTERVAL '15 days', 'open', 'academics', 80.0, 'capstone_portal'),
('CS 1337 Average Grade', 'Will the average grade for all CS 1337 sections be A- or higher?', temoc_id, NOW() - INTERVAL '15 days', NOW() + INTERVAL '30 days', 'open', 'academics', 150.0, 'instructor');

-- SPORTS
INSERT INTO markets (name, description, created_by, start_time, end_time, status, category, liquidity_parameter, resolution_source) VALUES
('UTD Soccer beats TAMU', 'Will the UTD Men''s Soccer team defeat Texas A&M in the spring friendly?', temoc_id, NOW() - INTERVAL '12 days', NOW() + INTERVAL '5 days', 'open', 'sports', 180.0, 'ncaa_scoreboard'),
('UTD Basketball vs UTA Win', 'UTD Basketball beats UT Arlington in the exhibition match?', temoc_id, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day', 'resolved', 'sports', 300.0, 'utdcomets_com'),
('UTD Overwatch vs UT Austin', 'Will UTD Esports defeat UT Austin in the Collegiate Championship?', enarc_id, NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', 'open', 'sports', 150.0, 'twitch_official'),
('UTD Rocket League Top 4', 'Will the Rocket League team reach the semi-finals?', temoc_id, NOW() - INTERVAL '14 days', NOW() + INTERVAL '25 days', 'open', 'sports', 130.0, 'tespa'),
('UTD Volleyball Title', 'Will UTD Volleyball win the Lone Star Conference title?', enarc_id, NOW() - INTERVAL '25 days', NOW() + INTERVAL '40 days', 'open', 'sports', 200.0, 'lsc_standings'),
('UTD Baseball vs Cameron', 'Will UTD Baseball win the 3-game series against Cameron?', temoc_id, NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days', 'open', 'sports', 110.0, 'utdcomets_com');

-- SOCIAL LIFE
INSERT INTO markets (name, description, created_by, start_time, end_time, status, category, liquidity_parameter, resolution_source) VALUES
('GDSC Kickoff Attendance > 50', 'GDSC kickoff has more than 50 people show up?', temoc_id, NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days', 'resolved', 'social', 120.0, 'officer_log'),
('HackUTD Reg 1.5k in 48h', 'Will HackUTD reach 1,500 registrations within 48 hours?', enarc_id, NOW() - INTERVAL '60 days', NOW() + INTERVAL '120 days', 'open', 'social', 500.0, 'hackutd_dashboard'),
('ACM Projects Showcase > 25', 'Will more than 25 projects be demoed at the ACM Spring Showcase?', temoc_id, NOW() - INTERVAL '15 days', NOW() + INTERVAL '30 days', 'open', 'social', 140.0, 'acmutd_co'),
('AIS Speaker Turnout > 100', 'Will the AI Society industry speaker event have 100+ attendees?', enarc_id, NOW() - INTERVAL '5 days', NOW() + INTERVAL '15 days', 'open', 'social', 110.0, 'eventbrite'),
('WEHack Multi-University > 10', 'Will WEHack have participants from more than 10 different universities?', enarc_id, NOW() - INTERVAL '12 days', NOW() + INTERVAL '20 days', 'open', 'social', 130.0, 'wehack_stats');

-- Fill remaining slots with generic UTD CS event variations
FOR i IN 1..25 LOOP
    INSERT INTO markets (name, description, created_by, start_time, end_time, status, category, liquidity_parameter)
    VALUES ('CS Social Event #' || i, 'Outcome for social event series #' || i, temoc_id, NOW() - INTERVAL '30 days', NOW() + (i || ' days')::INTERVAL, 'open', 'social', 100.0);
END LOOP;

END $$;

-- 4. CREATE OUTCOMES
INSERT INTO market_outcomes (market_id, description)
SELECT id, 'Yes / Over / Win' FROM markets;

INSERT INTO market_outcomes (market_id, description)
SELECT id, 'No / Under / Loss' FROM markets;

-- 5. CREATE BETS (500+ Random Bets)
-- We do this BEFORE the price history walk so we have actual activity to sync
INSERT INTO bets (user_id, outcome_id, amount, shares, is_settled, created_at)
SELECT 
    (1 + floor(random() * 99))::int,
    (SELECT id FROM market_outcomes ORDER BY random() LIMIT 1),
    (10 + random() * 200),
    (10 + random() * 180), -- We vary shares randomly to simulate uneven demand
    FALSE,
    NOW() - (floor(random() * 14) || ' days')::INTERVAL
FROM generate_series(1, 600);

-- 6. SYNCHRONIZE QUANTITIES (Fixes 50/50 Odds Issue)
-- This updates the LMSR 'quantity' field based on the aggregate shares in the bets table
UPDATE market_outcomes mo
SET quantity = COALESCE((
    SELECT SUM(shares) FROM bets WHERE outcome_id = mo.id
), 0);

-- 7. GENERATE DENSE PRICE HISTORY (For Charts)
-- Walk the price for 50 hours for every single outcome
DO $$
DECLARE
    outcome_record RECORD;
    i INT;
    current_price NUMERIC(8,6);
BEGIN
    FOR outcome_record IN SELECT id FROM market_outcomes LOOP
        -- Start price near 0.5 but adjust based on quantity (crude simulation of LMSR)
        current_price := 0.4 + (random() * 0.2);
        FOR i IN 1..50 LOOP
            current_price := current_price + (random() * 0.1 - 0.05);
            current_price := LEAST(GREATEST(current_price, 0.05), 0.95);
            
            INSERT INTO price_history (outcome_id, price, created_at)
            VALUES (outcome_record.id, current_price, NOW() - (i || ' hours')::INTERVAL);
        END LOOP;
    END LOOP;
END $$;

-- 8. RESOLVE SAMPLE MARKETS
-- Resolve Basketball (Market 10) as Win
UPDATE markets SET status = 'resolved', winning_outcome_id = (SELECT id FROM market_outcomes WHERE market_id = 10 AND description LIKE 'Yes%' LIMIT 1) WHERE id = 10;
-- Resolve GDSC (Market 16) as Win
UPDATE markets SET status = 'resolved', winning_outcome_id = (SELECT id FROM market_outcomes WHERE market_id = 15 AND description LIKE 'Yes%' LIMIT 1) WHERE id = 15;

-- Update bets for resolved markets
UPDATE bets SET is_settled = TRUE, payout_amount = amount * 1.8 
WHERE outcome_id IN (SELECT winning_outcome_id FROM markets WHERE status = 'resolved');

-- 9. LOG TRANSACTIONS & MESSAGES
INSERT INTO transactions (user_id, amount, reason)
SELECT id, token_balance, 'initial tokens' FROM users;

INSERT INTO transactions (user_id, amount, reason, created_at)
SELECT user_id, -amount, 'bet placed', created_at FROM bets;

INSERT INTO messages (user_id, market_id, content, created_at) VALUES
(3, 1, 'Math 2418 is killing me. Betting against the average.', NOW() - INTERVAL '1 day'),
(4, 1, 'Trust the curve, it always happens.', NOW() - INTERVAL '12 hours'),
(5, 17, 'Already 800 signed up for HackUTD!', NOW() - INTERVAL '2 hours');

-- ════════════════════════════════════════════════════════════════════════════════
-- SEED COMPLETE
-- ════════════════════════════════════════════════════════════════════════════════