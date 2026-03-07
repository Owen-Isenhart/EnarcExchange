#!/usr/bin/env node
/**
 * Run migration 004 (add markets.created_by). Uses same .env as the app.
 * Usage: node scripts/run-migration-004.js
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Pool } = require("pg");
const fs = require("fs");

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST || "localhost",
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: Number(process.env.PGPORT) || 5432,
    });

const sqlPath = path.join(__dirname, "../db/migrations/004_markets_created_by.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

pool
  .query(sql)
  .then(() => {
    console.log("Migration 004 (markets.created_by) ran successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
