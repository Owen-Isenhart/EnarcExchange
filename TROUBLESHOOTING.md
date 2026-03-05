# Troubleshooting: Signup, Login, and REST APIs

## The 2 things that usually break

### 1. GET /api/markets and GET /api/markets/1 return 500 — "column m.created_by does not exist"

Your DB is missing the `created_by` column on `markets`. Run the migration **once**:

```bash
node scripts/run-migration-004.js
```

Then restart the server and try again. No psql needed.

### 2. Swagger "Try it out" returns 401 — "Missing or invalid token"

- Get a real JWT: **POST /api/auth/login** with your email/password. Copy the **`token`** value (the long string starting with `eyJ...`).
- In Swagger, click **Authorize** and in the value box type exactly: **`Bearer `** (word Bearer + space) then paste the token, e.g. `Bearer eyJhbGci...`
- Click Authorize, then try the protected endpoint again.

---

## 1. Check the server is running

```bash
npm run dev
```

You should see: `✓ Database connection verified`, `✓ Server running on port 3000`. If the server exits or shows "Database connection failed", fix your `.env` (PGHOST, PGDATABASE, PGUSER, PGPASSWORD) or run migrations.

## 2. Test with curl or Postman

**Health (no DB):**
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok"}`

**DB connection:**
```bash
curl http://localhost:3000/health/db
```
Expected: `{"status":"ok","db":"connected","now":"..."}`. If you get 503 or `"db":"disconnected"`, the DB is not reachable or credentials are wrong.

**Login (must be POST with JSON body):**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"temoc@utdallas.edu\",\"password\":\"yourPassword\"}"
```
- If you get `"email and password are required"` → the body was not parsed. Send **Content-Type: application/json** and a valid JSON body.
- If you get `Invalid email or password` → wrong credentials or user not in DB (use seed or signup first).
- If you get `Too many login/signup attempts` → rate limit (wait 15 min or restart server; in dev the limit is 50/15min).

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@utdallas.edu\",\"username\":\"TestUser\",\"password\":\"password123\"}"
```
- Email must end with `@utdallas.edu`. Password at least 8 characters.

## 3. Common fixes

| Problem | Fix |
|--------|-----|
| Empty body / "required" errors | Always send `Content-Type: application/json` and a JSON body for POST. |
| 404 on /api/auth/login | Use **POST**, not GET. URL must be exactly `/api/auth/login`. |
| DB connection failed | Check `.env`: PGHOST, PGDATABASE, PGUSER, PGPASSWORD. Run `db/schema.sql` and `db/migrations/001_*.sql`, `002_*.sql` if needed. |
| 500 on /api/users/me/positions | Run migration `db/migrations/002_sells_table.sql`. The app can still run without it; other routes are unaffected. |
| Rate limit (429) on auth | In development the limit is 50 per 15 min. Restart the server to reset, or wait. |

## 4. Run migrations (if you haven’t)

From the project root, with `.env` set:

```bash
# Node one-liner for migration 001
node -e "require('dotenv').config({path:'.env'}); const pool=require('./src/config/db'); const fs=require('fs'); pool.query(fs.readFileSync('./db/migrations/001_lmsr_quantity_and_bet_shares.sql','utf8')).then(()=>{console.log('001 OK'); process.exit(0);}).catch(e=>{console.error(e.message); process.exit(1);});"

# Migration 002 (sells table)
node -e "require('dotenv').config({path:'.env'}); const pool=require('./src/config/db'); const fs=require('fs'); pool.query(fs.readFileSync('./db/migrations/002_sells_table.sql','utf8')).then(()=>{console.log('002 OK'); process.exit(0);}).catch(e=>{console.error(e.message); process.exit(1);});"
```

Or run the SQL files directly in psql or your DB client.
