const pool = require("../config/db");

const usersService = {
  getAllUsers: async (limit, offset) => {
    const users = await pool.query(
      `SELECT id, username, email, token_balance, is_admin, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    return {
      rows: users.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  getUserById: async (id) => {
    const result = await pool.query(
      `SELECT id, username, email, token_balance, is_admin, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  getUserByUsername: async (username) => {
    const result = await pool.query(
      `SELECT id, username, email, token_balance, is_admin, created_at
       FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  },

  getUserByEmail: async (email) => {
    const result = await pool.query(
      `SELECT id, email, username, password_hash, token_balance, is_admin, created_at
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  createUser: async (email, username, passwordHash) => {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, token_balance, is_admin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, token_balance, is_admin, created_at`,
      [email, username, passwordHash, 500, false]
    );
    return result.rows[0];
  },

  getUserStats: async (userId) => {
    const userResult = await pool.query(
      `SELECT id, username, token_balance, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const betStats = await pool.query(
      `SELECT 
        COUNT(*) as total_bets,
        SUM(amount) as total_wagered,
        SUM(CASE WHEN is_settled THEN payout_amount ELSE 0 END) as total_won
       FROM bets WHERE user_id = $1`,
      [userId]
    );

    const transactions = await pool.query(
      `SELECT amount, reason, created_at
       FROM transactions WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    return {
      user: userResult.rows[0],
      stats: betStats.rows[0],
      recent_transactions: transactions.rows,
    };
  },

  isAdmin: async (userId) => {
    const result = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );
    return result.rows.length > 0 && result.rows[0].is_admin;
  },
};

module.exports = usersService;
