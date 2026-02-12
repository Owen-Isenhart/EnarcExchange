const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const authenticate = require("../middleware/auth");

const router = express.Router();

const SALT_ROUNDS = 10;
const INITIAL_TOKENS = 500;
const UTD_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@utdallas\.edu$/;

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "email, username, and password are required" });
  }

  if (!UTD_EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Only @utdallas.edu emails are allowed" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, token_balance)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, token_balance, created_at`,
      [email, username, passwordHash, INITIAL_TOKENS]
    );

    const user = result.rows[0];

    // log the initial token grant
    await pool.query(
      `INSERT INTO transactions (user_id, amount, reason) VALUES ($1, $2, $3)`,
      [user.id, INITIAL_TOKENS, "initial tokens"]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "23505") {
      // unique violation
      return res.status(409).json({ error: "Email or username already exists" });
    }
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, username, password_hash, token_balance, created_at
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password_hash, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me  (protected)
router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, token_balance, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;