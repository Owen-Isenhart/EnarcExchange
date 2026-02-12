If you want to test schema.sql, write this on query editor:

-- Add some users
INSERT INTO users (email, password_hash) VALUES 
('alice@utdallas.edu', 'hashedpassword1'),
('bob@utdallas.edu', 'hashedpassword2');

-- Add a market
INSERT INTO markets (name, description, start_time, end_time) VALUES
('Linear Algebra Average Grade', 'Predict the average grade for MATH 2311', '2026-02-01 00:00', '2026-05-01 23:59');

-- Add outcomes for the market
INSERT INTO market_outcomes (market_id, description) VALUES
(1, 'Average grade is A'),
(1, 'Average grade is B'),
(1, 'Average grade is C');

-- Add bets
INSERT INTO bets (user_id, outcome_id, amount) VALUES
(1, 1, 100), -- Alice bets 100 tokens on A
(2, 2, 200); -- Bob bets 200 tokens on B

-- Add transactions
INSERT INTO transactions (user_id, amount, reason) VALUES
(1, 500, 'initial tokens'),
(2, 500, 'initial tokens'),
(1, -100, 'bet placed'),
(2, -200, 'bet placed');

-- Add a chat message
INSERT INTO messages (user_id, market_id, content) VALUES
(1, 1, 'I think A is definitely going to win!');






write this on query editor to test if dummy data is working properly:

-- See all users
SELECT * FROM users;

-- See all markets
SELECT * FROM markets;

-- See all bets for a market
SELECT b.id, u.email, mo.description, b.amount
FROM bets b
JOIN users u ON b.user_id = u.id
JOIN market_outcomes mo ON b.outcome_id = mo.id;

-- Check transactions
SELECT * FROM transactions;



sample output:
1	1	500	"initial tokens"	"2026-02-01 16:20:31.805675"
2	2	500	"initial tokens"	"2026-02-01 16:20:31.805675"
3	1	-100	"bet placed"	"2026-02-01 16:20:31.805675"
4	2	-200	"bet placed"	"2026-02-01 16:20:31.805675"
