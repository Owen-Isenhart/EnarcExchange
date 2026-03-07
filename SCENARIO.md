# Enarc Exchange — Full Scenario (One Story, Start to Finish)

One person signs up, bets on a market, sells some shares, checks history; then an admin creates a new market, seeds it, and resolves another. Every main feature in order. Use **Swagger** at `http://localhost:3000/api-docs` or curl; base URL **`http://localhost:3000`**.

---

## The story

**Jordan** (UTD student) finds Enarc Exchange, signs up, gets 500 Temoc Tokens, and browses the “Average CS 1337 Grade” market. They get a quote, place a bet, see their position and updated prices, then sell part of their position. They check their bets, transactions, and price history.

**Morgan** (admin) logs in, creates a new market “Library packed Friday?”, adds two outcomes, seeds liquidity, and resolves the CS grade market so Jordan gets paid for their winning shares. Jordan checks their stats and sees the payout.

---

## Part 1 — Jordan: discovery and auth

### 1.1 Check the API is up

- **GET** `/health`  
  Expect: `{ "status": "ok" }`

- **GET** `/health/db`  
  Expect: `{ "status": "ok", "db": "connected", "now": "..." }`

- **GET** `/`  
  Expect: JSON with `name`, `description`, and `links` to all endpoints.

### 1.2 Jordan signs up

- **POST** `/api/auth/signup`  
  Body:
  ```json
  {
    "email": "jordan@utdallas.edu",
    "username": "Jordan",
    "password": "TemocRocks1"
  }
  ```
  Expect: **201**, body has `token` (long `eyJ...` string) and `user` (id, email, username, token_balance **500**).  
  **Copy `token`** and note **`user.id`** (e.g. 10).

### 1.3 Jordan logs in (later session)

- **POST** `/api/auth/login`  
  Body:
  ```json
  {
    "email": "jordan@utdallas.edu",
    "password": "TemocRocks1"
  }
  ```
  Expect: **200**, `token` and `user`. Copy the **token** again for the next steps.

### 1.4 Jordan checks who they are

- **GET** `/api/auth/me`  
  Header: `Authorization: Bearer <JORDAN_TOKEN>`  
  Expect: **200**, `user` with id, username "Jordan", token_balance 500.

---

## Part 2 — Jordan: browse markets and LMSR

### 2.1 List markets

- **GET** `/api/markets`  
  Expect: **200**, `data` array of markets and `pagination`. Pick the **“Average CS 1337 Grade”** market; assume its **id is 1**.

### 2.2 Get that market

- **GET** `/api/markets/1`  
  Expect: **200**, one market with name, description, status **"open"**, start_time, end_time, created_by_username, liquidity_parameter.

### 2.3 Current LMSR prices (odds)

- **GET** `/api/markets/1/prices`  
  Expect: **200**, e.g.:
  - `market_id: 1`, `liquidity_parameter: 100`, `status: "open"`
  - `outcomes`: two rows — outcome_id **1** “Yes - Average is >= 3.67 GPA”, outcome_id **2** “No - Average is < 3.67 GPA”, each with `quantity` and `price` (prices sum to ~1.0).

### 2.4 Quote: “How many shares for 50 tokens on Yes?”

- **GET** `/api/markets/1/quote?outcome_id=1&amount=50`  
  Expect: **200**, `outcome_id: 1`, `cost_amount` ≈ 50, `shares` > 0, `current_prices` and `new_prices` (Yes price goes up, No goes down).

### 2.5 Quote: “How much to buy 10 shares of Yes?”

- **GET** `/api/markets/1/quote?outcome_id=1&shares=10`  
  Expect: **200**, `shares: 10`, `cost_amount` > 0, `current_prices` and `new_prices`.

---

## Part 3 — Jordan: place a bet and see the effect

### 3.1 Place bet (50 tokens on outcome 1 — Yes)

- **POST** `/api/bets`  
  Header: `Authorization: Bearer <JORDAN_TOKEN>`  
  Body:
  ```json
  {
    "outcome_id": 1,
    "amount": 50
  }
  ```
  Expect: **201**, bet record with `shares`, `market_id: 1`, and `new_prices`. Jordan’s balance drops by ~50 tokens.

### 3.2 Prices moved (LMSR)

- **GET** `/api/markets/1/prices`  
  Expect: **200**, outcome 1’s price **higher** than before, outcome 2’s **lower** (matches `new_prices` from the bet).

### 3.3 Jordan’s positions

- **GET** `/api/users/me/positions`  
  Header: `Authorization: Bearer <JORDAN_TOKEN>`  
  Expect: **200**, `positions` array with one entry: outcome_id 1, market_id 1, market_name “Average CS 1337 Grade”, **shares** = what they just bought.

- **GET** `/api/users/me/positions?market_id=1`  
  Same token. Expect: same positions, filtered to market 1.

### 3.4 Positions by user ID (same data)

- **GET** `/api/users/10/positions`  
  (Replace 10 with Jordan’s `user.id`.)  
  Expect: **200**, same positions as 3.3.

---

## Part 4 — Jordan: sell some shares

### 4.1 Sell 20 shares of outcome 1

- **POST** `/api/bets/sell`  
  Header: `Authorization: Bearer <JORDAN_TOKEN>`  
  Body:
  ```json
  {
    "outcome_id": 1,
    "shares": 20
  }
  ```
  (Use a number ≤ Jordan’s position.)  
  Expect: **201**, sell record with `tokens_received`, `new_prices`. Jordan’s balance goes **up** by `tokens_received`.

### 4.2 Positions decreased

- **GET** `/api/users/me/positions`  
  Header: `Authorization: Bearer <JORDAN_TOKEN>`  
  Expect: **200**, shares for outcome 1 **reduced by 20**.

### 4.3 Prices moved again

- **GET** `/api/markets/1/prices`  
  Expect: **200**, outcome 1’s price a bit **lower** than after the bet, outcome 2’s a bit **higher** (sell pushed prices back).

---

## Part 5 — Jordan: history (bets, transactions, outcomes, prices)

### 5.1 Jordan’s bets

- **GET** `/api/bets/user/10`  
  (Replace 10 with Jordan’s id.)  
  Expect: **200**, `data` with the bet from 3.1 (and any others), pagination.

### 5.2 Bets on market 1

- **GET** `/api/bets/market/1`  
  Expect: **200**, all bets on market 1 (including Jordan’s).

### 5.3 One bet by ID

- **GET** `/api/bets/3`  
  (Use a real bet id from 5.1.)  
  Expect: **200**, single bet with user, outcome, amount, shares, etc.

### 5.4 All transactions (audit trail)

- **GET** `/api/transactions`  
  Expect: **200**, `data` with “initial tokens”, “Bet placed”, “Sold X shares”, etc., pagination.

### 5.5 Jordan’s transactions

- **GET** `/api/transactions/user/10`  
  (Replace 10 with Jordan’s id.)  
  Expect: **200**, only Jordan’s transactions (signup bonus, bet, sell).

### 5.6 List outcomes

- **GET** `/api/outcomes`  
  Expect: **200**, all outcomes; use for outcome IDs elsewhere.

### 5.7 Outcomes for market 1

- **GET** `/api/outcomes/market/1`  
  Expect: **200**, two outcomes (Yes / No for CS 1337 grade).

### 5.8 One outcome

- **GET** `/api/outcomes/1`  
  Expect: **200**, outcome 1 with market_id, description, quantity, etc.

### 5.9 Price history (all)

- **GET** `/api/prices`  
  Expect: **200**, paginated price records.

### 5.10 Latest price per outcome

- **GET** `/api/prices/latest`  
  Expect: **200**, array of { outcome_id, price, created_at }.

### 5.11 Price history for outcome 1

- **GET** `/api/prices/outcome/1`  
  Expect: **200**, history for outcome 1 (initial, after bet, after sell).

### 5.12 One price record

- **GET** `/api/prices/1`  
  (Use a real id from 5.9 or 5.11.)  
  Expect: **200**, one price row.

---

## Part 6 — Morgan (admin): new market, seed, resolve

Use a user with **`is_admin = true`** in the DB (e.g. set in PostgreSQL or use a seeded admin). Get their JWT with **POST** `/api/auth/login` and use it as **`<MORGAN_TOKEN>`**.

### 6.1 Morgan creates a new market

- **POST** `/api/markets`  
  Header: `Authorization: Bearer <MORGAN_TOKEN>`  
  Body:
  ```json
  {
    "name": "Will the library be packed Friday?",
    "description": "Yes or No",
    "start_time": "2026-03-10T00:00:00Z",
    "end_time": "2026-03-15T00:00:00Z",
    "liquidity_parameter": 100
  }
  ```
  Expect: **201**, created market; note **id** (e.g. 4).

### 6.2 Morgan adds two outcomes

- **POST** `/api/outcomes`  
  Header: `Authorization: Bearer <MORGAN_TOKEN>`  
  Body: `{ "market_id": 4, "description": "Yes - Packed" }`  
  Expect: **201**, outcome (e.g. id 7).

- **POST** `/api/outcomes`  
  Header: `Authorization: Bearer <MORGAN_TOKEN>`  
  Body: `{ "market_id": 4, "description": "No - Empty" }`  
  Expect: **201**, outcome (e.g. id 8).

### 6.3 Morgan seeds liquidity (no bets yet)

- **GET** `/api/outcomes/market/4`  
  Expect: **200**, two outcomes; note ids (e.g. 7, 8).

- **POST** `/api/markets/4/seed`  
  Header: `Authorization: Bearer <MORGAN_TOKEN>`  
  Body: `{ "quantities": [10, -10] }`  
  (Order matches outcome id order.)  
  Expect: **200**.

### 6.4 Prices after seed

- **GET** `/api/markets/4/prices`  
  Expect: **200**, prices **not** 50/50; they reflect the seeded quantities.

### 6.5 Morgan resolves the CS grade market (outcome 1 wins)

- **POST** `/api/markets/1/resolve`  
  Header: `Authorization: Bearer <MORGAN_TOKEN>`  
  Body: `{ "winning_outcome_id": 1 }`  
  Expect: **200**, `payouts` array (Jordan and anyone else with shares on outcome 1 get 1 token per share). Market 1 is now **resolved**.

### 6.6 No more trading on resolved market

- **POST** `/api/bets`  
  Header: `Authorization: Bearer <JORDAN_TOKEN>`  
  Body: `{ "outcome_id": 1, "amount": 10 }`  
  Expect: **400** (market closed/resolved).

- **POST** `/api/bets/sell`  
  Header: `Authorization: Bearer <JORDAN_TOKEN>`  
  Body: `{ "outcome_id": 1, "shares": 5 }`  
  Expect: **400** (market not open).

### 6.7 Jordan’s stats after resolve

- **GET** `/api/users/10/stats`  
  (Replace 10 with Jordan’s id.)  
  Expect: **200**, `user` (token_balance **increased** by payout), `stats`, `recent_transactions` including “Bet won” or similar for the resolved market.

---

## Part 7 — Users and transactions (any role)

### 7.1 List users

- **GET** `/api/users`  
  Expect: **200**, paginated users (Jordan, Morgan, others).

### 7.2 User by username

- **GET** `/api/users/username/Jordan`  
  Expect: **200**, Jordan’s profile (no password).

### 7.3 User by ID

- **GET** `/api/users/10`  
  (Replace 10 with Jordan’s id.)  
  Expect: **200**, same user.

### 7.4 Create a transaction (e.g. bonus)

- **POST** `/api/transactions`  
  Header: `Authorization: Bearer <MORGAN_TOKEN>` or `<JORDAN_TOKEN>`  
  Body: `{ "user_id": 10, "amount": 50, "reason": "Bonus" }`  
  Expect: **201** (if your app allows it).

### 7.5 Get transaction by ID

- **GET** `/api/transactions/1`  
  (Use a real id.)  
  Expect: **200**, one transaction.

---

## Part 8 — WebSocket: live prices

### 8.1 Subscribe and see updates

1. Connect a Socket.io client to `http://localhost:3000` (browser console or a small Node script).
2. Subscribe to market 1:  
   `socket.emit("market:subscribe", 1)`
3. From another tab or curl, place a bet on market 1 (**POST** `/api/bets` with outcome for market 1) or sell (**POST** `/api/bets/sell`).
4. The client should receive **`market:prices`** with updated LMSR prices for market 1.

---

## Quick reference

| Part | Who    | What |
|------|--------|------|
| 1    | Jordan | Health, root, signup, login, me |
| 2    | Jordan | List/get markets, prices, quote (tokens + shares) |
| 3    | Jordan | Place bet, prices again, my positions |
| 4    | Jordan | Sell shares, positions again, prices again |
| 5    | Jordan | Bets (list, by user, by market, by id), transactions, outcomes, price history |
| 6    | Morgan | Create market, create outcomes, seed, resolve, block trading, user stats |
| 7    | Any    | Users list/username/id, create transaction, get transaction by id |
| 8    | Any    | WebSocket subscribe + market:prices on bet/sell |

Run Parts 1–8 in order and you’ve hit the whole API and LMSR flow in one scenario.
