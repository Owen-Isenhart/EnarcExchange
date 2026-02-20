const pool = require("../config/db");

const authService = {
  createUser: async (email, username, passwordHash) => {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, token_balance, is_admin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, token_balance, is_admin, created_at`,
      [email, username, passwordHash, 500, false]
    );

    await pool.query(
      `INSERT INTO transactions (user_id, amount, reason) 
       VALUES ($1, $2, $3)`,
      [result.rows[0].id, 500, "initial tokens"]
    );

    return result.rows[0];
  },

  getUserByEmail: async (email) => {
    const result = await pool.query(
      `SELECT id, email, username, password_hash, token_balance, is_admin, created_at
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  getUserById: async (id) => {
    const result = await pool.query(
      `SELECT id, email, username, token_balance, is_admin, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  emailExists: async (email) => {
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    return result.rows.length > 0;
  },

  usernameExists: async (username) => {
    const result = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    return result.rows.length > 0;
  },
};

module.exports = authService;
