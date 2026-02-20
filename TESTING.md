# Testing Enarc Exchange API

Use this guide to test each feature. **Prerequisites:**

1. PostgreSQL running with schema applied (`db/schema.sql`) and optionally seed data (`db/seed.sql`).
2. `.env` filled with `PG*`, `JWT_SECRET`, and `PORT` (or default 3000).
3. Server running: `npm run dev` (or `npm start`).

**Base URL:** `http://localhost:3000` (or your `PORT`).

Use **Git Bash**, **WSL**, or **PowerShell**. For PowerShell, if a command fails on the JSON body, try putting the JSON in a file and use `curl ... -d "@body.json"` instead.

---

## 1. Root & health

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

Expected: JSON with app name and links, then `{"status":"ok"}`.

---

## 2. Auth

### Signup (new user — use a real @utdallas.edu-style email)

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tester@utdallas.edu\",\"username\":\"tester\",\"password\":\"password123\"}"
```

Expected: `201` with `token` and `user` (id, email, username, token_balance 500). **Copy the `token`** for the next steps.

### Login (same user)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tester@utdallas.edu\",\"password\":\"password123\"}"
```

Expected: `200` with `token` and `user`. Copy `token` if you didn’t from signup.

### Get current user (protected)

Replace `YOUR_TOKEN` with the token from signup/login.

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: `200` with `user` (id, email, username, token_balance, created_at).

### Auth edge cases

- Signup with non-@utdallas.edu email → `400` "Only @utdallas.edu emails are allowed".
- Login with wrong password → `401` "Invalid email or password".
- `/me` without header or with bad token → `401`.

---

## 3. Markets

### List all markets

```bash
curl http://localhost:3000/markets
```

Expected: JSON array of markets (empty if no seed, or 3 if you ran seed).

### Get one market

```bash
curl http://localhost:3000/markets/1
```

Expected: JSON array with one market (id 1). If no market 1, empty array or 500.

### Create market

```bash
curl -X POST http://localhost:3000/markets \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Market\",\"description\":\"Will it rain tomorrow?\"}"
```

Expected: `200` and message like "Market added with ID: ...".

### Update market

```bash
curl -X PUT http://localhost:3000/markets/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Updated Name\",\"description\":\"Updated description\"}"
```

Expected: `200` "Market modified with ID: 1".

### Delete market

```bash
curl -X DELETE http://localhost:3000/markets/2
```

Expected: `200` "Market with ID: 2 has been deleted". (Use an ID you’re okay removing.)

---

## 4. Outcomes (per market)

### List all outcomes

```bash
curl http://localhost:3000/outcomes
```

Expected: Array of outcomes (e.g. 6 if seed ran).

### Get one outcome

```bash
curl http://localhost:3000/outcomes/1
```

### Create outcome (for a market)

```bash
curl -X POST http://localhost:3000/outcomes \
  -H "Content-Type: application/json" \
  -d "{\"marketID\":1,\"description\":\"Yes - It will happen\"}"
```

Expected: `200` "Outcome added with ID: ...".

---

## 5. Prices (price_history)

### List all price history rows

```bash
curl http://localhost:3000/prices
```

### Get one price row

```bash
curl http://localhost:3000/prices/1
```

### Create price snapshot (for an outcome)

```bash
curl -X POST http://localhost:3000/prices \
  -H "Content-Type: application/json" \
  -d "{\"outcomeID\":1,\"price\":0.6}"
```

Expected: `200` "Price added with ID: ...". Price should be between 0 and 1.

---

## 6. Bets

### List all bets

```bash
curl http://localhost:3000/bets
```

### Get one bet

```bash
curl http://localhost:3000/bets/1
```

### Create bet (body: userID, outcomeID, amount)

You need a valid `user_id` (e.g. from signup response) and `outcome_id` (e.g. 1 or 2 for market 1). Current API does **not** check balance or use auth; it’s for testing only.

```bash
curl -X POST http://localhost:3000/bets \
  -H "Content-Type: application/json" \
  -d "{\"userID\":1,\"outcomeID\":1,\"amount\":25}"
```

Expected: `200` "bet added with ID: ...". (If user 1 doesn’t exist, you’ll get a DB error; use your signup user id from `/api/auth/me`.)

---

## 7. Users

### List all users

```bash
curl http://localhost:3000/users
```

Expected: Array of users. **Note:** Currently this may include sensitive fields; avoid in production.

### Get one user by ID

```bash
curl http://localhost:3000/users/1
```

---

## 8. Transactions

### List all transactions

```bash
curl http://localhost:3000/transactions
```

### Get transactions by user ID (route is GET /transactions/:id — :id = user_id)

```bash
curl http://localhost:3000/transactions/1
```

Expected: All transactions where `user_id = 1`.

### Create transaction (testing only — no auth; don’t expose in production)

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d "{\"userID\":1,\"amount\":100,\"reason\":\"test credit\"}"
```

Expected: `200` "transaction added with ID: ...".

---

## 9. API docs (Swagger)

If `src/swagger-output.json` exists:

- Open: **http://localhost:3000/api-docs**
- Use the UI to try the same endpoints with a form.

---

## Quick checklist

| Feature        | Endpoint(s)                          | How to verify              |
|----------------|--------------------------------------|----------------------------|
| Root           | `GET /`                              | JSON with name & links     |
| Health         | `GET /health`                        | `{"status":"ok"}`          |
| Signup         | `POST /api/auth/signup`              | 201, token + user, 500 bal |
| Login          | `POST /api/auth/login`               | 200, token + user          |
| Me             | `GET /api/auth/me` + Bearer token     | 200, current user          |
| List markets   | `GET /markets`                       | 200, array                 |
| Get market     | `GET /markets/:id`                   | 200, array of 1            |
| Create market  | `POST /markets`                      | 200, "Market added..."     |
| Update market  | `PUT /markets/:id`                   | 200                        |
| Delete market  | `DELETE /markets/:id`                | 200                        |
| Outcomes       | `GET /outcomes`, `GET /outcomes/:id`, `POST /outcomes` | 200 + body    |
| Prices         | `GET /prices`, `GET /prices/:id`, `POST /prices`       | 200 + body    |
| Bets           | `GET /bets`, `GET /bets/:id`, `POST /bets`             | 200 + body    |
| Users          | `GET /users`, `GET /users/:id`       | 200, array / user          |
| Transactions   | `GET /transactions`, `GET /transactions/:id`, `POST`   | 200 + body    |
| API docs       | `GET /api-docs`                      | Swagger UI loads           |

---

**Tip:** Seed users (e.g. `temoc@utdallas.edu`) use a placeholder password hash, so **login only works for users you create via signup**. Use signup → login → `/me` to test auth fully.
