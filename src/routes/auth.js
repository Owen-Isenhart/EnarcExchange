const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/auth");
const validators = require("../utils/validators");
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

const router = express.Router();

const SALT_ROUNDS = 10;

// POST /api/auth/signup
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // Validate inputs
    if (!email || !username || !password) {
      return res.status(400).json({
        error: "email, username, and password are required",
      });
    }

    if (!validators.email(email)) {
      return res.status(400).json({
        error: "Only @utdallas.edu emails are allowed",
      });
    }

    if (!validators.nonEmptyString(username)) {
      return res.status(400).json({
        error: "Username is required and cannot be empty",
      });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        error: "Username must be between 3 and 50 characters",
      });
    }

    if (!validators.password(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    try {
      // Check if email already exists
      if (await authService.emailExists(email)) {
        return res.status(409).json({ error: "email already exists" });
      }

      // Check if username already exists
      if (await authService.usernameExists(username)) {
        return res.status(409).json({ error: "username already exists" });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await authService.createUser(email, username, passwordHash);

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.status(201).json({ token, user });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  })
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email and password are required",
      });
    }

    try {
      const user = await authService.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

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
  })
);

// GET /api/auth/me (protected)
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  })
);

module.exports = router;
