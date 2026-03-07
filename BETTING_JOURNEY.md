# Enarc Exchange — Full Betting Journey (One Story, Every Feature)

One complete flow that hits **every** API surface: health, auth, markets, LMSR prices, quote, bet, positions, sell, outcomes, transactions, price history, admin seed/resolve, and WebSocket.

**Base URL:** `http://localhost:3000`  
**Tool:** Swagger UI at `http://localhost:3000/api-docs` (Authorize with `Bearer <token>`) or curl.

---

## Act 1: Setup & discovery

### 1. Health & root

- **GET** `/health` → `{ "status": "ok" }`
- **GET** `/health/db` → DB connected
- **GET** `/` → app name + `links` (use these paths for the rest)

### 2. Create a character (signup)

- **POST** `/api/auth/signup`  
  Body: `{ "email": "alex@utdallas.edu", "username": "AlexTrader", "password": "TemocRocks1" }`  
  → 201, **copy `token`** (and note your `user.id`)

### 3. Come back later (login)

- **POST** `/api/auth/login`  
  Body: `{ "email": "alex@utdallas.edu", "password": "TemocRocks1" }`  
  → 200, **copy `token`** for protected calls

### 4. Who am I? (current user)

- **GET** `/api/auth/me`  
  Header: `Authorization: Bearer <token>`  
  → 200, your user (id, username, token_balance 500)

---

## Act 2: Browse markets & LMSR prices

### 5. List markets

- **GET** `/api/markets`  
  → List of markets. Pick one **open** market and note its `id` (e.g. **1**). Note its outcome IDs from the payload or from step 7.

### 6. Get one market

- **GET** `/api/markets/1`  
  → Full market (name, description, status, start_time, end_time, created_by_username, liquidity_parameter)

### 7. LMSR prices (current odds)

- **GET** `/api/markets/1/prices`  
  → `outcomes` with `outcome_id`, `description`, `quantity`, `price`. Prices sum to ~1.0.

### 8. Quote by tokens (“How many shares for 50 tokens?”)

- **GET** `/api/markets/1/quote?outcome_id=1&amount=50`  
  → `shares`, `cost_amount`, `current_prices`, `new_prices`

### 9. Quote by shares (“How much to buy 10 shares?”)

- **GET** `/api/markets/1/quote?outcome_id=1&shares=10`  
  → `cost_amount`, `new_prices`

---

## Act 3: Place a bet & see positions

### 10. Place bet (spend tokens, get shares)

- **POST** `/api/bets`  
  Header: `Authorization: Bearer <token>`  
  Body: `{ "outcome_id": 1, "amount": 50 }`  
  → 201, `shares`, `new_prices`; your balance decreases by ~50 tokens

### 11. Prices moved (LMSR)

- **GET** `/api/markets/1/prices` again  
  → Outcome 1’s price higher, outcome 2’s lower (same as `new_prices` from bet)

### 12. My positions (shares I own)

- **GET** `/api/users/me/positions`  
  Header: `Authorization: Bearer <token>`  
  Optional: `?market_id=1`  
  → List of outcomes with `shares` (bets − sells). You should see outcome 1 with shares from step 10.

### 13. My positions by user ID (same user)

- **GET** `/api/users/<your-user-id>/positions`  
  → Same as step 12 (use `user.id` from `/api/auth/me`)

---

## Act 4: Sell some shares

### 14. Sell part of position

- **POST** `/api/bets/sell`  
  Header: `Authorization: Bearer <token>`  
  Body: `{ "outcome_id": 1, "shares": 20 }` (use ≤ your position)  
  → 201, `tokens_received`, `new_prices`; balance increases

### 15. Positions decreased

- **GET** `/api/users/me/positions`  
  → Shares for outcome 1 decreased by 20

### 16. Prices moved back

- **GET** `/api/markets/1/prices`  
  → Prices shifted back toward the other outcome after the sell

---

## Act 5: Bets & transactions history

### 17. List my bets

- **GET** `/api/bets/user/<your-user-id>`  
  → Bets you placed (including the one from step 10)

### 18. Bets for this market

- **GET** `/api/bets/market/1`  
  → All bets on market 1

### 19. Get one bet by ID

- **GET** `/api/bets/<bet-id>`  
  (use an `id` from step 17)

### 20. List transactions (audit trail)

- **GET** `/api/transactions`  
  → All transactions (initial tokens, bet placed, sell credited, etc.)

### 21. My transactions

- **GET** `/api/transactions/user/<your-user-id>`  
  → Your token in/out history

---

## Act 6: Outcomes & price history

### 22. List outcomes

- **GET** `/api/outcomes`  
  → All outcomes (use for outcome IDs in other calls)

### 23. Outcomes for market 1

- **GET** `/api/outcomes/market/1`  
  → Two outcomes (Yes / No) for “Average CS 1337 Grade”

### 24. Get outcome by ID

- **GET** `/api/outcomes/1`

### 25. Price history (global)

- **GET** `/api/prices`  
  → Paginated price records

### 26. Latest price per outcome

- **GET** `/api/prices/latest`  
  → Latest price for each outcome

### 27. Price history for one outcome

- **GET** `/api/prices/outcome/1`  
  → How outcome 1’s price changed over time (bet/sell updates)

---

## Act 7: Admin — seed & resolve (requires admin user)

Use a user with `is_admin = true` (set in DB). Get their JWT via **POST** `/api/auth/login`, then use that token below.

### 28. Create a new market (admin)

- **POST** `/api/markets`  
  Header: `Authorization: Bearer <admin-token>`  
  Body: `{ "name": "Will the library be packed Friday?", "description": "Yes/No", "start_time": "2026-03-10T00:00:00Z", "end_time": "2026-03-15T00:00:00Z", "liquidity_parameter": 100 }`  
  → 201, new market (e.g. id 4)

### 29. Create outcomes for new market (admin)

- **POST** `/api/outcomes`  
  Header: `Authorization: Bearer <admin-token>`  
  Body: `{ "market_id": 4, "description": "Yes - Packed" }`  
  → 201  
- **POST** `/api/outcomes` again with `{ "market_id": 4, "description": "No - Empty" }`  
  → 201

### 30. Seed liquidity (admin, no bets yet)

- **GET** `/api/outcomes/market/4`  
  → Note outcome IDs (e.g. 7, 8)  
- **POST** `/api/markets/4/seed`  
  Header: `Authorization: Bearer <admin-token>`  
  Body: `{ "quantities": [10, -10] }`  
  → 200

### 31. Prices after seed

- **GET** `/api/markets/4/prices`  
  → Prices no longer 50/50; reflect seeded quantities

### 32. Resolve a market (admin)

- **POST** `/api/markets/1/resolve`  
  Header: `Authorization: Bearer <admin-token>`  
  Body: `{ "winning_outcome_id": 1 }`  
  → 200, `payouts` (who got paid). Market 1 status → resolved.

### 33. No more trading on resolved market

- **POST** `/api/bets` with body `{ "outcome_id": 1, "amount": 10 }`  
  → 400 (market closed/resolved)  
- **POST** `/api/bets/sell`  
  → 400 on resolved market

### 34. User stats after resolve

- **GET** `/api/users/<your-user-id>/stats`  
  → Balance reflects payouts if you had winning shares

---

## Act 8: Users & misc

### 35. List users

- **GET** `/api/users`  
  → Paginated users

### 36. User by username

- **GET** `/api/users/username/AlexTrader`

### 37. User by ID

- **GET** `/api/users/<your-user-id>`

### 38. Create transaction (admin/special)

- **POST** `/api/transactions`  
  Header: `Authorization: Bearer <token>`  
  Body: `{ "user_id": <id>, "amount": 50, "reason": "Bonus" }`  
  → 201 (if allowed by your app rules)

### 39. Get transaction by ID

- **GET** `/api/transactions/1`

---

## Act 9: WebSocket (live prices)

### 40. Subscribe and see prices update

1. Open a Socket.io client (browser console or Node script) and connect to `http://localhost:3000`.
2. Emit: `socket.emit("market:subscribe", 1)` (marketId = 1).
3. From another tab or curl, **POST** `/api/bets` on market 1 (or **POST** `/api/bets/sell`).
4. Your client should receive a `market:prices` event with the updated LMSR prices for market 1.

---

## Checklist summary

| # | Feature              | Endpoint(s) |
|---|----------------------|-------------|
| 1–4 | Health, root, signup, login, me | `/`, `/health`, `/health/db`, `/api/auth/*` |
| 5–9 | Markets list, get, prices, quote (tokens/shares) | `/api/markets`, `/api/markets/:id`, `/api/markets/:id/prices`, `/api/markets/:id/quote` |
| 10–13 | Place bet, prices, my positions | `/api/bets`, `/api/markets/:id/prices`, `/api/users/me/positions`, `/api/users/:id/positions` |
| 14–16 | Sell shares, positions, prices | `/api/bets/sell`, `/api/users/me/positions`, `/api/markets/:id/prices` |
| 17–21 | Bets list, by user/market, by id; transactions | `/api/bets/*`, `/api/transactions/*` |
| 22–27 | Outcomes, price history | `/api/outcomes/*`, `/api/prices/*` |
| 28–34 | Admin: create market/outcomes, seed, resolve | `/api/markets`, `/api/outcomes`, `/api/markets/:id/seed`, `/api/markets/:id/resolve` |
| 35–39 | Users, transaction by id | `/api/users/*`, `/api/transactions/:id` |
| 40 | WebSocket | Socket.io `market:subscribe`, `market:prices` |

Run through this journey once and you’ve exercised the whole API and LMSR flow.
