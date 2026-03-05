# Enarc Exchange
## Overview
* **Enarc Exchange** is a prediction market specifically for the University of Texas at Dallas. As a student, you can bet (using Temoc Tokens, not real money) on academics, sports, and really anything having to do with UTD! Think that the average grade for linear algebra this semseter will be an A? Bet on it!
## MVP
* **Auth:** 
    * Users should be restricted to only those with @utdallas.edu emails
    * Simple authentication with email/password and JWT
    * Upon signup, a new user is issued 500 tokens
* **Market:**
    * Markets should be able to be created
    * Markets should have betting and pricing functionality (LMSR)
    * Markets should be able to be resolved and distribute tokens
* **Real Time Data:**
    * Markets should update with live data using websockets
    * Markets should have live chat feed
* **Profiles:**
    * Should have CRUD functionality for accessing user specific data (P/L, active bets, closed bets, etc.)
## Stretch Goals
* **Integration with UTD Data:** For markets where it applies, say for instance there's a market on what the dining hall will serve on a given day, we pull data from [here](https://dineoncampus.com/utdallasdining/whats-on-the-menu/comet-pi-the-market-dhw/) to determine the resolution instead of doing it manually
* **Automatic AI Generated Markets:** Integrate with Gemini or another LLM, give it context for UTD and prompt it for what markets make sense. Make it automatically run if the number of markets drops below a certain threshold, so we never have zero available markets to bet on.
* **Leaderboard:** Show the most successful traders based on profits
* **Containerization:** Ideally we get to containerize this using Docker, but we may just not have time to get to it
## Tech Stack
* **API:** Node/Express
* **DB:** PostgreSQL
* **Websockets:** Socket.io
* **Auth:** JWT
* **AI Features:** Gemini Flash
* **Containerization:** Docker
* **Documentation:** Swagger
* **Deployment:** AWS (EC2 and RDS)
* **Testing:**
    * Jest (unit tests)
    * Postman (API testing)
* **Frontend:** Next.js *(This is a backend project, but it would be nice to actually visualize what yall are building. If anyone wants the experience they can do this, otherwise I'll throw something together towards the end.)*

## API Usage

When the server is running, **GET /** returns a list of links. Use the base URL (e.g. `http://localhost:3000`) for all requests below.

### Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register. Body: `{ "email": "you@utdallas.edu", "username": "YourName", "password": "yourPassword" }`. Returns user + JWT. New users get 500 tokens. |
| POST | `/api/auth/login` | Login. Body: `{ "email": "you@utdallas.edu", "password": "yourPassword" }`. Returns JWT. |

**Protected routes** require the JWT in the header:
```http
Authorization: Bearer <your-jwt>
```

### Markets (`/api/markets`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/markets` | List markets (paginated). Query: `?page=1&limit=10`. |
| GET | `/api/markets/:id` | Get one market by ID. |
| GET | `/api/markets/:id/prices` | **LMSR prices** for that market — current outcome prices and quantities. |
| GET | `/api/markets/:id/quote?outcome_id=1&amount=50` | **Quote by tokens:** shares you get and new prices. |
| GET | `/api/markets/:id/quote?outcome_id=1&shares=10` | **Quote by shares:** cost (tokens) to buy 10 shares and new prices. |
| POST | `/api/markets` | Create market (admin). Body: `name`, `description`, `start_time`, `end_time`, optional `liquidity_parameter`. |
| PUT | `/api/markets/:id` | Update market (admin). |
| POST | `/api/markets/:id/resolve` | **Resolve market** (admin). Body: `{ "winning_outcome_id": 5 }`. Pays 1 token per share to winning bets. |
| POST | `/api/markets/:id/seed` | **Seed liquidity** (admin). Body: `{ "quantities": [q0, q1, ...] }` or `{ "quantities": { "outcome_id": q } }`. Market must be open and have no bets. |
| DELETE | `/api/markets/:id` | Delete market (admin). |

### Bets (`/api/bets`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bets` | List all bets. Query: `?page=1&limit=10`. |
| GET | `/api/bets/:id` | Get one bet by ID. |
| GET | `/api/bets/user/:userId` | Bets for a user. |
| GET | `/api/bets/market/:marketId` | Bets for a market. |
| POST | `/api/bets` | **Place a bet.** Auth required. Body: `{ "outcome_id": 1, "amount": 50 }`. Returns bet + `market_id` and `new_prices`. |
| POST | `/api/bets/sell` | **Sell shares** (LMSR). Auth required. Body: `{ "outcome_id": 1, "shares": 20 }`. Market must be open; shares ≤ your position. |

### Users, Transactions, Outcomes, Prices

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List users. |
| GET | `/api/users/:id` | Get one user (e.g. profile, balance). |
| GET | `/api/users/me/positions` | **My positions** (LMSR). Auth required. Optional: `?market_id=1`. Returns shares per outcome (bets − sells). |
| GET | `/api/users/:userId/positions` | User positions. Optional: `?market_id=1`. |
| GET | `/api/transactions` | List transactions. Query: `?page=1&limit=10`. |
| GET | `/api/outcomes` | List outcomes. Use outcome IDs from a market for quote/bets. |
| GET | `/api/prices` | Price history records (paginated). |
| GET | `/api/prices/latest` | Latest price per outcome. |
| GET | `/api/prices/outcome/:outcomeId` | Price history for one outcome. |

For **current LMSR prices** by market, use **`GET /api/markets/:id/prices`** rather than `/api/prices`.

### Quick workflow

1. **GET `/api/markets`** — pick a market `id`.
2. **GET `/api/markets/1/prices`** — see current LMSR prices for market 1.
3. **GET `/api/markets/1/quote?outcome_id=1&amount=50`** — preview cost and new prices.
4. **POST `/api/auth/login`** — get JWT.
5. **POST `/api/bets`** with `Authorization: Bearer <token>` and body `{ "outcome_id": 1, "amount": 50 }` — place bet; response includes updated `new_prices`.

### Testing the LMSR (step-by-step)

Use a REST client (Postman, Insomnia, or `curl`). Base URL: `http://localhost:3000` (or your server). Run migrations first: `db/migrations/001_*.sql` and `db/migrations/002_*.sql`.

| # | What to test | How |
|---|----------------|-----|
| 1 | **Health** | `GET /health` → `{ "status": "ok" }`. |
| 2 | **Auth** | `POST /api/auth/login` with `{ "email": "temoc@utdallas.edu", "password": "yourPassword" }` (or signup). Copy the `token` from the response. |
| 3 | **Markets list** | `GET /api/markets` → list of markets. Note a market `id` (e.g. 1) and its outcome IDs from `GET /api/markets/1` (or from outcomes list). |
| 4 | **LMSR prices** | `GET /api/markets/1/prices` → `outcomes` with `quantity` and `price` per outcome. With no trades, prices are 50/50 for two outcomes. |
| 5 | **Quote by tokens** | `GET /api/markets/1/quote?outcome_id=1&amount=50` → `shares`, `cost_amount`, `current_prices`, `new_prices`. |
| 6 | **Quote by shares** | `GET /api/markets/1/quote?outcome_id=1&shares=10` → `cost_amount` (tokens to buy 10 shares), `new_prices`. |
| 7 | **Place bet** | `POST /api/bets` with header `Authorization: Bearer <token>` and body `{ "outcome_id": 1, "amount": 50 }`. Check response has `shares`, `new_prices`, and your balance decreased. |
| 8 | **My positions** | `GET /api/users/me/positions` with `Authorization: Bearer <token>`. Optional: `?market_id=1`. You should see the outcome(s) you bet on with `shares` > 0. |
| 9 | **Sell shares** | `POST /api/bets/sell` with `Authorization: Bearer <token>` and body `{ "outcome_id": 1, "shares": 20 }` (use ≤ your position). Check `tokens_received`, `new_prices`, and balance increased. |
| 10 | **Seed liquidity** | As **admin**: `POST /api/markets/1/seed` with `Authorization: Bearer <admin-token>` and body `{ "quantities": [ 10, -10 ] }` (array in outcome id order). Only works if market is open and has **no bets**. Then `GET /api/markets/1/prices` — prices change from 50/50. |
| 11 | **Resolve market** | As **admin**: `POST /api/markets/3/resolve` with body `{ "winning_outcome_id": 5 }`. Check response has `payouts`; winning bettors’ balances and `bets.is_settled` / `payout_amount` updated. |
| 12 | **WebSocket** | Connect to Socket.io (e.g. `socket.io-client`). Emit `market:subscribe` with `marketId`, then place a bet on that market — you should receive `market:prices` with updated prices. |

**Notes:** For admin routes (seed, resolve) you need a user with `is_admin = true` in the DB. For sell, the market must be **open** and you can only sell up to your **position** (bets − sells for that outcome).

### Other

| Path | Description |
|------|-------------|
| GET `/health` | Health check. Returns `{ "status": "ok" }`. |
| GET `/api-docs` | Swagger UI — full API docs in the browser. |

## LMSR: position and sell

We **do not use a dedicated positions table**. Position is derived from bets (and, when implemented, from sells) so there is a single source of truth and resolve/payout logic stays simple.

* **Position today**  
  A user’s share balance in an outcome = sum of `shares` over all their **bets** on that outcome (for that market). Compute with something like: `SUM(bets.shares) WHERE user_id = ? AND outcome_id = ?` (and optionally restrict to bets in open markets if you only care about “current” tradeable position).

* **Resolve / payouts**  
  When a market is resolved, only **bets** are used: for each bet on the winning outcome, payout = `shares × payout_per_share` (e.g. 1 token per share), credit the user, set `payout_amount` and `is_settled`. No positions table to keep in sync.

* **Sell (implemented)**  
  If we add “sell shares back to the market”:
  * Add a **sells** table (e.g. `user_id`, `outcome_id`, `shares`, `tokens_received`, `created_at`).
  * **Position** = `SUM(bets.shares) − SUM(sells.shares)` for that user and outcome.
  * On sell: decrease the outcome’s LMSR quantity, credit the user (using `costToSell`), and insert a row in `sells`. Still no separate positions table.

Keep this approach consistent so resolve and sell logic stay correct.

## Resources
* [Intro to Rest APIs (just first 2 mins and 30 seconds)](https://www.youtube.com/watch?v=-MTSQjw5DrM)
* [JWT Intro](https://www.youtube.com/watch?v=mbsmsi7l3r4)
* [Node/Express/Typescript part 1](https://www.youtube.com/watch?v=NYZKUTGC51g)
* [Node/Express/Typescript part 2](https://www.youtube.com/watch?v=8Dv9yWAJ6ww)
* [Node/Express/Typescript part 3](https://www.youtube.com/watch?v=dr8e6Nh1llk)
* [Chat/Sockets Example](https://www.youtube.com/watch?v=jD7FnbI76Hg)
* [Deploying to EC2](https://www.youtube.com/watch?v=T-Pum2TraX4)
* [Intro to Database Design](https://www.youtube.com/watch?v=5RpUmDEsn1k)
* [AWS RDS](https://www.youtube.com/watch?v=I_fTQTsz2nQ)
* [Swagger Documentation Generator (I haven't tried this, so if it doesn't work we'll just do it manually. This is a good use case for AI)](https://www.youtube.com/watch?v=Ck-CoNNn89g)
* [LMSR Primer 1](http://blog.oddhead.com/2006/10/30/implementing-hansons-market-maker/)
* [LMSR Primer 2](https://gnosis-pm-js.readthedocs.io/en/v1.3.0/lmsr-primer.html)
* [Example LMSR JS Implementation](https://github.com/cdetrio/prediction-market-lmsr)
* [LMSR demo](https://cdetr.io/prediction-market-lmsr/index.html)
* [System Design](https://www.youtube.com/watch?v=BTjxUS_PylA)
## Timeline
*this is subject to change*
* **Week 1:** PostgreSQL schema design, Express server initialization
* **Week 2:** Authentication and begining to set up token economy/market logic
* **Week 3:** Prediction market core logic
* **Week 4:** Real time features (sockets)
* **Week 5:** Stretch goals and testing
* **Week 6:** Containerization and deployment
