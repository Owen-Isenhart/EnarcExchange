-- ════════════════════════════════════════════════════════════════════════════════
-- ENARCEXCHANGE SEED DATA - Comprehensive Sample Data
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. CLEANUP 
TRUNCATE messages, idempotency_keys, transactions, sells, bets, price_history, market_outcomes, markets, users CASCADE;

-- ────────────────────────────────────────────────────────────────────────────────
-- 2. CREATE USERS (20 students & staff)
-- ────────────────────────────────────────────────────────────────────────────────
INSERT INTO users (email, username, password_hash, token_balance, is_admin) VALUES
('temoc@utdallas.edu', 'TemocOfficial', 'hash123', 5000, TRUE),
('enarc@utdallas.edu', 'CraneMaster', 'hash123', 2500, TRUE),
('tobias@utdallas.edu', 'TobiasTheCat', 'hash123', 1500, FALSE),
('student1@utdallas.edu', 'CometTrader', 'hash123', 1200, FALSE),
('student2@utdallas.edu', 'NorthsideNightmare', 'hash123', 800, FALSE),
('alex.chen@utdallas.edu', 'AlexTheAnalyst', 'hash123', 2100, FALSE),
('maya.patel@utdallas.edu', 'MayaP', 'hash123', 950, FALSE),
('jordan.smith@utdallas.edu', 'JordanS', 'hash123', 1750, FALSE),
('chris.johnson@utdallas.edu', 'ChrisJ', 'hash123', 675, FALSE),
('sarah.williams@utdallas.edu', 'SarahWilliams', 'hash123', 2300, FALSE),
('mike.davis@utdallas.edu', 'MikeDavis', 'hash123', 1050, FALSE),
('emma.wilson@utdallas.edu', 'EmmaW', 'hash123', 3200, FALSE),
('liam.brown@utdallas.edu', 'LiamB', 'hash123', 890, FALSE),
('olivia.miller@utdallas.edu', 'OliviaM', 'hash123', 1400, FALSE),
('noah.taylor@utdallas.edu', 'NoahT', 'hash123', 2750, FALSE),
('ava.anderson@utdallas.edu', 'AvaA', 'hash123', 1100, FALSE),
('ethan.thomas@utdallas.edu', 'EthanT', 'hash123', 950, FALSE),
('sophia.jackson@utdallas.edu', 'SophiaJ', 'hash123', 2050, FALSE),
('mason.white@utdallas.edu', 'MasonW', 'hash123', 1600, FALSE),
('isabella.harris@utdallas.edu', 'IsabellaH', 'hash123', 3500, FALSE);

-- ────────────────────────────────────────────────────────────────────────────────
-- 3. CREATE MARKETS (14 markets across categories)
-- ────────────────────────────────────────────────────────────────────────────────

-- ACADEMICS CATEGORY
INSERT INTO markets (name, description, created_by, start_time, end_time, status, category, liquidity_parameter, resolution_source) VALUES
('CS 1337 Average Grade', 'Will the average grade for all CS 1337 sections be A- or higher?', 1, NOW() - INTERVAL '2 days', NOW() + INTERVAL '30 days', 'open', 'academics', 150.0, 'instructor'),
('Math 2418 Curve', 'Will there be a curve on the Math 2418 final exam?', 2, NOW() - INTERVAL '5 days', NOW() + INTERVAL '20 days', 'open', 'academics', 120.0, 'instructor'),
('Dean List Increase', 'Will more than 15% of students make Dean List this semester?', 1, NOW() - INTERVAL '10 days', NOW() + INTERVAL '45 days', 'open', 'academics', 100.0, 'registrar'),
('Fall 2026 Enrollment', 'Will Fall 2026 enrollment exceed 22,000 students?', 2, NOW() - INTERVAL '15 days', '2026-08-15 23:59:59', 'closed', 'academics', 200.0, 'enrollment_office');

-- CAMPUS LIFE CATEGORY
INSERT INTO markets (name, description, created_by, start_time, end_time, status, category, liquidity_parameter, resolution_source) VALUES
('Student Union Expansion', 'Will the SU expansion be completed by Fall 2026?', 1, NOW() - INTERVAL '20 days', '2026-08-31 23:59:59', 'open', 'campus', 180.0, 'facilities'),
('Parking Pass Price Increase', 'Will parking pass prices increase for Fall 2026?', 5, NOW() - INTERVAL '3 days', '2026-06-01 23:59:59', 'open', 'campus', 110.0, 'parking_office'),
('Spring Concert Lineup', 'Will the spring concert feature a top 10 artist?', 8, NOW() - INTERVAL '7 days', NOW() + INTERVAL '25 days', 'open', 'campus', 130.0, 'student_activities');

-- DINING CATEGORY  
INSERT INTO markets (name, description, created_by, start_time, end_time, status, category, liquidity_parameter, resolution_source) VALUES
('Dining Hall West Taco Tuesday', 'Will DHW serve street tacos this Tuesday?', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 'resolved', 'dining', 100.0, 'visual_confirmation'),
('UT Dallas Dining Expansion', 'Will a new on-campus restaurant open by May 2026?', 3, NOW() - INTERVAL '25 days', '2026-05-31 23:59:59', 'resolved', 'dining', 140.0, 'dining_services'),
('Jamba Juice Price Change', 'Will smoothie prices increase by next semester?', 6, NOW() - INTERVAL '8 days', NOW() + '40 days', 'open', 'dining', 95.0, 'jamba_juice'),
('Pizza Night at McDermott', 'Will McDermott host pizza night next week?', 10, NOW() - INTERVAL '2 days', NOW() + INTERVAL '7 days', 'open', 'dining', 80.0, 'student_center');

-- SPORTS & EVENTS CATEGORY
INSERT INTO markets (name, description, created_by, start_time, end_time, status, category, liquidity_parameter, resolution_source) VALUES
('Comet Basketball Tournament', 'Will the basketball team win the conference tournament?', 4, NOW() - INTERVAL '12 days', '2026-04-30 23:59:59', 'open', 'sports', 250.0, 'athletics'),
('Intramural Volleyball', 'Will CS students win the intramural volleyball tournament?', 7, NOW() - INTERVAL '6 days', NOW() + INTERVAL '35 days', 'open', 'sports', 105.0, 'rec_center'),
('Spring Break Weather', 'Will spring break have 3+ days above 80°F?', 14, NOW() - INTERVAL '1 day', '2026-03-21 23:59:59', 'open', 'events', 125.0, 'weather_service');

-- MISCELLANEOUS
INSERT INTO markets (name, description, created_by, start_time, end_time, status, category, liquidity_parameter, resolution_source) VALUES
('Library Late Hours', 'Will the library extend hours during finals week?', 2, NOW() - INTERVAL '9 days', NOW() + INTERVAL '22 days', 'closed', 'miscellaneous', 85.0, 'library_admin');

-- ────────────────────────────────────────────────────────────────────────────────
-- 4. CREATE MARKET OUTCOMES
-- ────────────────────────────────────────────────────────────────────────────────

-- Market 1: CS 1337 Average Grade
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (1, 'Yes - 3.67+ GPA', 0), (1, 'No - Below 3.67 GPA', 0);

-- Market 2: Math 2418 Curve
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (2, 'Yes - Curve applied', 0), (2, 'No - No curve', 0);

-- Market 3: Dean List Increase
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (3, 'Yes - >15%', 0), (3, 'No - ≤15%', 0);

-- Market 4: Fall 2026 Enrollment
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (4, 'Yes - >22,000', 0), (4, 'No - ≤22,000', 0);

-- Market 5: Student Union Expansion
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (5, 'Yes - Completed', 0), (5, 'No - Still ongoing', 0);

-- Market 6: Parking Pass Price
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (6, 'Yes - Price increase', 0), (6, 'No - Same price', 0);

-- Market 7: Spring Concert
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (7, 'Yes - Top 10 artist', 0), (7, 'No - Not top 10', 0);

-- Market 8: Taco Tuesday (RESOLVED - Outcome: YES tacos served)
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (8, 'Yes - Tacos served', 120.5), (8, 'No - No tacos', 95.3);

-- Market 9: Dining Expansion (RESOLVED - Outcome: NO new restaurant)
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (9, 'Yes - New restaurant', 85.2), (9, 'No - No new restaurant', 110.8);

-- Market 10: Jamba Juice Price
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (10, 'Yes - Price increase', 0), (10, 'No - Same price', 0);

-- Market 11: Pizza Night
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (11, 'Yes - Pizza night happens', 0), (11, 'No - Cancelled', 0);

-- Market 12: Comet Basketball
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (12, 'Yes - Tournament win', 0), (12, 'No - No tournament win', 0);

-- Market 13: Intramural Volleyball
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (13, 'Yes - CS wins', 0), (13, 'No - CS loses', 0);

-- Market 14: Spring Break Weather
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (14, 'Yes - 3+ days 80°F+', 0), (14, 'No - Fewer than 3 days', 0);

-- Market 15: Library Hours (RESOLVED - Outcome: YES extended hours)
INSERT INTO market_outcomes (market_id, description, quantity) VALUES (15, 'Yes - Extended hours', 95.0), (15, 'No - Normal hours', 88.0);

-- ────────────────────────────────────────────────────────────────────────────────
-- 5. RESOLVE MARKETS AND SET WINNERS
-- ────────────────────────────────────────────────────────────────────────────────
UPDATE markets SET winning_outcome_id = (SELECT id FROM market_outcomes WHERE market_id = 8 LIMIT 1) WHERE id = 8;
UPDATE markets SET winning_outcome_id = (SELECT id FROM market_outcomes WHERE market_id = 9 OFFSET 1 LIMIT 1) WHERE id = 9;
UPDATE markets SET winning_outcome_id = (SELECT id FROM market_outcomes WHERE market_id = 15 LIMIT 1) WHERE id = 15;

-- ────────────────────────────────────────────────────────────────────────────────
-- 6. ADD PRICE HISTORY
-- ────────────────────────────────────────────────────────────────────────────────
INSERT INTO price_history (outcome_id, price, created_at) VALUES
-- Market 1 (CS 1337)
((SELECT id FROM market_outcomes WHERE market_id = 1 ORDER BY id LIMIT 1), 0.58, NOW() - INTERVAL '2 days'),
((SELECT id FROM market_outcomes WHERE market_id = 1 ORDER BY id LIMIT 1), 0.62, NOW() - INTERVAL '1 day'),
((SELECT id FROM market_outcomes WHERE market_id = 1 ORDER BY id LIMIT 1), 0.60, NOW()),
-- Market 2 (Math 2418)
((SELECT id FROM market_outcomes WHERE market_id = 2 ORDER BY id LIMIT 1), 0.45, NOW() - INTERVAL '5 days'),
((SELECT id FROM market_outcomes WHERE market_id = 2 ORDER BY id LIMIT 1), 0.48, NOW()),
-- Market 5 (SU Expansion)
((SELECT id FROM market_outcomes WHERE market_id = 5 ORDER BY id LIMIT 1), 0.35, NOW() - INTERVAL '20 days'),
((SELECT id FROM market_outcomes WHERE market_id = 5 ORDER BY id LIMIT 1), 0.40, NOW()),
-- Market 8 (Taco Tuesday - Resolved)
((SELECT id FROM market_outcomes WHERE market_id = 8 ORDER BY id LIMIT 1), 0.55, NOW() - INTERVAL '5 days'),
((SELECT id FROM market_outcomes WHERE market_id = 8 ORDER BY id LIMIT 1), 0.75, NOW() - INTERVAL '2 days'),
((SELECT id FROM market_outcomes WHERE market_id = 8 ORDER BY id LIMIT 1), 1.00, NOW() - INTERVAL '1 day'),
-- Market 9 (Dining Expansion - Resolved)
((SELECT id FROM market_outcomes WHERE market_id = 9 ORDER BY id LIMIT 1), 0.45, NOW() - INTERVAL '25 days'),
((SELECT id FROM market_outcomes WHERE market_id = 9 ORDER BY id LIMIT 1), 0.30, NOW() - INTERVAL '10 days'),
((SELECT id FROM market_outcomes WHERE market_id = 9 ORDER BY id LIMIT 1), 0.00, NOW() - INTERVAL '1 day'),
-- Market 12 (Basketball)
((SELECT id FROM market_outcomes WHERE market_id = 12 ORDER BY id LIMIT 1), 0.50, NOW() - INTERVAL '12 days'),
((SELECT id FROM market_outcomes WHERE market_id = 12 ORDER BY id LIMIT 1), 0.55, NOW()),
-- Market 15 (Library - Resolved)
((SELECT id FROM market_outcomes WHERE market_id = 15 ORDER BY id LIMIT 1), 0.52, NOW() - INTERVAL '9 days'),
((SELECT id FROM market_outcomes WHERE market_id = 15 ORDER BY id LIMIT 1), 0.65, NOW() - INTERVAL '2 days'),
((SELECT id FROM market_outcomes WHERE market_id = 15 ORDER BY id LIMIT 1), 1.00, NOW() - INTERVAL '1 day');

-- ────────────────────────────────────────────────────────────────────────────────
-- 7. CREATE BETS (Active and Resolved)
-- ────────────────────────────────────────────────────────────────────────────────

-- Market 1 bets (CS 1337 - ACTIVE)
INSERT INTO bets (user_id, outcome_id, amount, shares, is_settled) VALUES
(4, (SELECT id FROM market_outcomes WHERE market_id = 1 LIMIT 1), 100.0, 95.5, FALSE),
(6, (SELECT id FROM market_outcomes WHERE market_id = 1 OFFSET 1 LIMIT 1), 75.0, 68.2, FALSE),
(9, (SELECT id FROM market_outcomes WHERE market_id = 1 LIMIT 1), 200.0, 190.0, FALSE),
(12, (SELECT id FROM market_outcomes WHERE market_id = 1 OFFSET 1 LIMIT 1), 50.0, 45.5, FALSE);

-- Market 2 bets (Math 2418 - ACTIVE)
INSERT INTO bets (user_id, outcome_id, amount, shares, is_settled) VALUES
(5, (SELECT id FROM market_outcomes WHERE market_id = 2 LIMIT 1), 125.0, 115.0, FALSE),
(11, (SELECT id FROM market_outcomes WHERE market_id = 2 OFFSET 1 LIMIT 1), 80.0, 85.5, FALSE),
(14, (SELECT id FROM market_outcomes WHERE market_id = 2 LIMIT 1), 60.0, 55.0, FALSE);

-- Market 5 bets (SU Expansion - ACTIVE)
INSERT INTO bets (user_id, outcome_id, amount, shares, is_settled) VALUES
(3, (SELECT id FROM market_outcomes WHERE market_id = 5 LIMIT 1), 150.0, 135.0, FALSE),
(8, (SELECT id FROM market_outcomes WHERE market_id = 5 OFFSET 1 LIMIT 1), 200.0, 180.0, FALSE),
(16, (SELECT id FROM market_outcomes WHERE market_id = 5 LIMIT 1), 100.0, 90.0, FALSE);

-- Market 8 bets (Taco Tuesday - RESOLVED, YES was winner)
INSERT INTO bets (user_id, outcome_id, amount, payout_amount, shares, is_settled) VALUES
(1, (SELECT id FROM market_outcomes WHERE market_id = 8 LIMIT 1), 100.0, 225.0, 102.3, TRUE),
(4, (SELECT id FROM market_outcomes WHERE market_id = 8 LIMIT 1), 50.0, 112.5, 51.2, TRUE),
(7, (SELECT id FROM market_outcomes WHERE market_id = 8 OFFSET 1 LIMIT 1), 75.0, 0.0, 76.5, TRUE),
(13, (SELECT id FROM market_outcomes WHERE market_id = 8 LIMIT 1), 150.0, 337.5, 153.5, TRUE),
(17, (SELECT id FROM market_outcomes WHERE market_id = 8 OFFSET 1 LIMIT 1), 100.0, 0.0, 101.5, TRUE);

-- Market 9 bets (Dining Expansion - RESOLVED, NO was winner)
INSERT INTO bets (user_id, outcome_id, amount, payout_amount, shares, is_settled) VALUES
(2, (SELECT id FROM market_outcomes WHERE market_id = 9 LIMIT 1), 120.0, 0.0, 112.0, TRUE),
(8, (SELECT id FROM market_outcomes WHERE market_id = 9 OFFSET 1 LIMIT 1), 200.0, 480.0, 186.0, TRUE),
(10, (SELECT id FROM market_outcomes WHERE market_id = 9 OFFSET 1 LIMIT 1), 80.0, 192.0, 74.5, TRUE),
(15, (SELECT id FROM market_outcomes WHERE market_id = 9 LIMIT 1), 90.0, 0.0, 84.0, TRUE);

-- Market 12 bets (Basketball - ACTIVE)
INSERT INTO bets (user_id, outcome_id, amount, shares, is_settled) VALUES
(1, (SELECT id FROM market_outcomes WHERE market_id = 12 LIMIT 1), 300.0, 280.0, FALSE),
(10, (SELECT id FROM market_outcomes WHERE market_id = 12 OFFSET 1 LIMIT 1), 150.0, 140.0, FALSE),
(19, (SELECT id FROM market_outcomes WHERE market_id = 12 LIMIT 1), 200.0, 185.0, FALSE);

-- Market 15 bets (Library - RESOLVED, YES was winner)
INSERT INTO bets (user_id, outcome_id, amount, payout_amount, shares, is_settled) VALUES
(5, (SELECT id FROM market_outcomes WHERE market_id = 15 LIMIT 1), 80.0, 196.0, 78.0, TRUE),
(12, (SELECT id FROM market_outcomes WHERE market_id = 15 OFFSET 1 LIMIT 1), 60.0, 0.0, 58.5, TRUE),
(18, (SELECT id FROM market_outcomes WHERE market_id = 15 LIMIT 1), 100.0, 245.0, 98.0, TRUE);

-- ────────────────────────────────────────────────────────────────────────────────
-- 8. CREATE SELLS (Users selling shares)
-- ────────────────────────────────────────────────────────────────────────────────
INSERT INTO sells (user_id, outcome_id, shares, tokens_received) VALUES
(1, (SELECT id FROM market_outcomes WHERE market_id = 8 LIMIT 1), 50.0, 85.5),
(4, (SELECT id FROM market_outcomes WHERE market_id = 8 LIMIT 1), 25.6, 43.75),
(8, (SELECT id FROM market_outcomes WHERE market_id = 9 OFFSET 1 LIMIT 1), 93.0, 165.25),
(10, (SELECT id FROM market_outcomes WHERE market_id = 9 OFFSET 1 LIMIT 1), 37.25, 66.10),
(2, (SELECT id FROM market_outcomes WHERE market_id = 1 LIMIT 1), 35.0, 52.50),
(18, (SELECT id FROM market_outcomes WHERE market_id = 15 LIMIT 1), 49.0, 85.75);

-- ────────────────────────────────────────────────────────────────────────────────
-- 9. CREATE TRANSACTIONS (Activity log)
-- ────────────────────────────────────────────────────────────────────────────────
INSERT INTO transactions (user_id, amount, reason, created_at) VALUES
-- Initial tokens
(1, 500, 'initial tokens', NOW() - INTERVAL '60 days'),
(2, 500, 'initial tokens', NOW() - INTERVAL '58 days'),
(3, 500, 'initial tokens', NOW() - INTERVAL '55 days'),
(4, 500, 'initial tokens', NOW() - INTERVAL '52 days'),
(5, 500, 'initial tokens', NOW() - INTERVAL '50 days'),
(6, 500, 'initial tokens', NOW() - INTERVAL '48 days'),
(7, 500, 'initial tokens', NOW() - INTERVAL '45 days'),
(8, 500, 'initial tokens', NOW() - INTERVAL '43 days'),
(9, 500, 'initial tokens', NOW() - INTERVAL '40 days'),
(10, 500, 'initial tokens', NOW() - INTERVAL '38 days'),
(11, 500, 'initial tokens', NOW() - INTERVAL '35 days'),
(12, 500, 'initial tokens', NOW() - INTERVAL '33 days'),
(13, 500, 'initial tokens', NOW() - INTERVAL '30 days'),
(14, 500, 'initial tokens', NOW() - INTERVAL '28 days'),
(15, 500, 'initial tokens', NOW() - INTERVAL '25 days'),
(16, 500, 'initial tokens', NOW() - INTERVAL '23 days'),
(17, 500, 'initial tokens', NOW() - INTERVAL '20 days'),
(18, 500, 'initial tokens', NOW() - INTERVAL '18 days'),
(19, 500, 'initial tokens', NOW() - INTERVAL '15 days'),
(20, 500, 'initial tokens', NOW() - INTERVAL '13 days'),

-- Bets placed
(1, -100, 'bet placed', NOW() - INTERVAL '5 days'),
(1, -300, 'bet placed', NOW() - INTERVAL '12 days'),
(4, -100, 'bet placed', NOW() - INTERVAL '2 days'),
(4, -50, 'bet placed', NOW() - INTERVAL '5 days'),
(7, -75, 'bet placed', NOW() - INTERVAL '5 days'),
(8, -200, 'bet placed', NOW() - INTERVAL '3 days'),
(8, -200, 'bet placed', NOW() - INTERVAL '25 days'),
(10, -150, 'bet placed', NOW() - INTERVAL '12 days'),
(10, -80, 'bet placed', NOW() - INTERVAL '25 days'),
(13, -150, 'bet placed', NOW() - INTERVAL '5 days'),
(14, -60, 'bet placed', NOW() - INTERVAL '5 days'),
(15, -90, 'bet placed', NOW() - INTERVAL '25 days'),
(19, -200, 'bet placed', NOW() - INTERVAL '12 days'),

-- Bets won/settled
(1, 225, 'bet won', NOW() - INTERVAL '1 day'),
(1, 0, 'bet settled - loss', NOW() - INTERVAL '1 day'),
(4, 112.5, 'bet won', NOW() - INTERVAL '1 day'),
(4, 0, 'bet settled - loss', NOW() - INTERVAL '1 day'),
(8, 480, 'bet won', NOW() - INTERVAL '1 day'),
(8, 0, 'bet settled - loss', NOW() - INTERVAL '1 day'),
(10, 192, 'bet won', NOW() - INTERVAL '1 day'),
(10, 0, 'bet settled - loss', NOW() - INTERVAL '1 day'),
(13, 337.5, 'bet won', NOW() - INTERVAL '1 day'),
(18, 245, 'bet won', NOW() - INTERVAL '1 day'),
(5, 196, 'bet won', NOW() - INTERVAL '1 day'),

-- Share sales
(1, 85.5, 'shares sold', NOW() - INTERVAL '2 days'),
(4, 43.75, 'shares sold', NOW() - INTERVAL '2 days'),
(8, 165.25, 'shares sold', NOW() - INTERVAL '2 days'),
(10, 66.10, 'shares sold', NOW() - INTERVAL '2 days'),
(2, 52.50, 'shares sold', NOW() - INTERVAL '3 days'),
(18, 85.75, 'shares sold', NOW() - INTERVAL '3 days');

-- ────────────────────────────────────────────────────────────────────────────────
-- 10. CREATE MESSAGES (Market chat)
-- ────────────────────────────────────────────────────────────────────────────────
INSERT INTO messages (user_id, market_id, content, created_at) VALUES
-- Market 1 (CS 1337)
(1, 1, 'Prof Smith said something about a curve, but it was hard to hear', NOW() - INTERVAL '2 days'),
(4, 1, 'I think the average will be above 3.7, historically this class curves well', NOW() - INTERVAL '1 day'),
(6, 1, 'Recent exam seemed harder than last semester though', NOW() - INTERVAL '18 hours'),
(9, 1, 'Anyone else struggle with the pointers unit?', NOW() - INTERVAL '12 hours'),

-- Market 2 (Math 2418)
(5, 2, 'Math curves are always unpredictable', NOW() - INTERVAL '5 days'),
(11, 2, 'Betting there is NO curve - these professors rarely use them', NOW() - INTERVAL '3 days'),
(14, 2, 'Final is supposedly comprehensive, so maybe they will curve', NOW() - INTERVAL '1 day'),

-- Market 5 (SU)
(3, 5, 'Construction site looks like they''re making progress finally', NOW() - INTERVAL '20 days'),
(8, 5, 'I heard August August completion date is just wishful thinking', NOW() - INTERVAL '15 days'),
(16, 5, 'Either way, new study spaces will be amazing', NOW() - INTERVAL '7 days'),
(1, 5, 'My money is on it NOT finishing on time. UTD construction always delays', NOW() - INTERVAL '3 days'),

-- Market 8 (Tacos)
(4, 8, 'Really hope for street tacos! 🌮', NOW() - INTERVAL '5 days'),
(7, 8, 'Dining hall west been boring lately', NOW() - INTERVAL '3 days'),
(1, 8, 'TACOS ARE HAPPENING THIS TUESDAY! Saw the menu update', NOW() - INTERVAL '1 day'),
(13, 8, 'YES!!! I''ve been craving these all semester', NOW() - INTERVAL '1 day'),

-- Market 12 (Basketball)
(1, 12, 'Comet basketball has been playing really well this season', NOW() - INTERVAL '12 days'),
(10, 12, 'Conference tournament is going to be tough competition', NOW() - INTERVAL '10 days'),
(19, 12, 'We have a shot at this! Tournament lineup looks favorable', NOW() - INTERVAL '5 days'),
(4, 12, 'I''m not as confident... but the team has momentum', NOW() - INTERVAL '2 days'),

-- Market 15 (Library)
(5, 15, 'Library extended hours would be clutch for finals', NOW() - INTERVAL '9 days'),
(12, 15, 'Probably will keep normal hours during finals even though it''s packed', NOW() - INTERVAL '6 days'),
(18, 15, '24-HOUR LIBRARY HOURS CONFIRMED! Check the official announcement', NOW() - INTERVAL '1 day'),
(1, 15, 'YESSSSS! Finals week just got much better', NOW() - INTERVAL '1 day');

-- ════════════════════════════════════════════════════════════════════════════════
-- SEED COMPLETE
-- ════════════════════════════════════════════════════════════════════════════════
-- Users: 20 total (2 admins, 18 regular)
-- Markets: 15 total (4 academics, 3 campus, 4 dining, 3 sports/events, 1 misc)
-- Resolved: 3 markets (with winners set and outcomes settled)
-- Active bets: 13 unresolved positions
-- Resolved bets: 13 settled positions
-- Sells: 6 share sales transactions
-- Messages: 28 market chat messages
-- ════════════════════════════════════════════════════════════════════════════════