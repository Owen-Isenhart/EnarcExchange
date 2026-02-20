# Setting Up the Database in pgAdmin

## 1. Create the database

1. Open **pgAdmin** and connect to your PostgreSQL server (e.g. **Servers → PostgreSQL**).
2. Right‑click **Databases** → **Create** → **Database**.
3. **Database** name: `enarc_exchange` (or any name — use the same in your `.env` as `PGDATABASE`).
4. Click **Save**.

---

## 2. Create the tables (run the schema)

1. In the left tree, expand **Databases** and click your new database (e.g. **enarc_exchange**).
2. Click **Tools** → **Query Tool** (or right‑click the database → **Query Tool**).
3. Open your project’s **`db/schema.sql`** in a text editor, copy **all** of its contents, and paste into the Query Tool.
4. Click **Execute** (▶) or press **F5**.
5. You should see “Query returned successfully” and in the left tree under **Schemas → public → Tables** you should see:
   - `users`
   - `markets`
   - `market_outcomes`
   - `price_history`
   - `bets`
   - `transactions`
   - `messages`

---

## 3. (Optional) Load sample data

1. With the same database selected, open **Query Tool** again (or use the same window and clear it).
2. Open **`db/seed.sql`** in a text editor, copy **all** of its contents, and paste into the Query Tool.
3. Click **Execute** (▶).
4. If you get errors about existing data or sequences, that’s okay if you’ve already run seed before. For a **fresh** database, seed should run without errors and you’ll get sample users, markets, outcomes, and bets.

**Note:** Seed users use a placeholder password hash, so you **cannot log in** as them. Use **Signup** in the app to create a real account for testing.

---

## 4. Connect your app

In your project’s **`.env`** (in the project root), set:

```env
PGUSER=postgres
PGHOST=localhost
PGDATABASE=enarc_exchange
PGPASSWORD=your_postgres_password
PGPORT=5432
```

- **PGUSER** = the PostgreSQL user you use in pgAdmin (often `postgres`).
- **PGPASSWORD** = that user’s password (the one you set when installing PostgreSQL or in pgAdmin).
- **PGDATABASE** = the database you created in step 1 (e.g. `enarc_exchange`).

Restart your Node server and try signup again.

---

## Troubleshooting

- **“relation already exists”** — You already ran `schema.sql`. Either use a new database or skip step 2.
- **“password authentication failed”** — Wrong `PGUSER` or `PGPASSWORD` in `.env`; use the same user/password you use in pgAdmin.
- **“database does not exist”** — `PGDATABASE` in `.env` must match the database name you created in step 1.
