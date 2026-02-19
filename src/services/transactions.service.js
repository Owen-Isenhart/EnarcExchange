const pool = require("../config/db");

const transactionsService = {
  getAllTransactions: async (limit, offset) => {
    const transactions = await pool.query(
      `SELECT t.*, u.username
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM transactions");
    return {
      rows: transactions.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  getTransactionById: async (id) => {
    const result = await pool.query(
      `SELECT t.*, u.username
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  getUserTransactions: async (userId, limit, offset) => {
    const transactions = await pool.query(
      `SELECT id, amount, reason, created_at
       FROM transactions 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM transactions WHERE user_id = $1",
      [userId]
    );

    return {
      rows: transactions.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  createTransaction: async (userId, amount, reason) => {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, reason)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, amount, reason]
    );
    return result.rows[0];
  },

  userExists: async (userId) => {
    const result = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );
    return result.rows.length > 0;
  },
};

module.exports = transactionsService;
