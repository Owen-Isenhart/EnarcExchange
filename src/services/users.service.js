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
      `SELECT id, username, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const betStats = await pool.query(
      `SELECT 
        COUNT(*) as total_bets,
        COALESCE(SUM(CASE WHEN is_settled AND payout_amount > amount THEN 1 ELSE 0 END), 0) as wins,
        COALESCE(SUM(CASE WHEN is_settled AND payout_amount < amount THEN 1 ELSE 0 END), 0) as losses,
        COALESCE(SUM(CASE WHEN NOT is_settled THEN 1 ELSE 0 END), 0) as open_bets,
        COALESCE(SUM(amount), 0) as total_wagered,
        COALESCE(SUM(CASE WHEN is_settled THEN payout_amount - amount ELSE 0 END), 0) as total_won
       FROM bets WHERE user_id = $1`,
      [userId]
    );

    const stats = betStats.rows[0];
    const totalWagered = parseFloat(stats.total_wagered) || 0;
    const totalWon = parseFloat(stats.total_won) || 0;
    const roi = totalWagered > 0 ? (totalWon / totalWagered) * 100 : 0;

    return {
      user_id: userResult.rows[0].id,
      username: userResult.rows[0].username,
      total_bets: parseInt(stats.total_bets) || 0,
      wins: parseInt(stats.wins) || 0,
      losses: parseInt(stats.losses) || 0,
      open_bets: parseInt(stats.open_bets) || 0,
      total_wagered: totalWagered,
      total_won: totalWon,
      roi: roi,
      created_at: userResult.rows[0].created_at,
    };
  },

  isAdmin: async (userId) => {
    const result = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );
    return result.rows.length > 0 && result.rows[0].is_admin;
  },

  /** LMSR: user position = SUM(bets.shares) - SUM(sells.shares) per outcome. Optional marketId filter. */
  getPositions: async (userId, marketId = null) => {
    const params = [userId];
    let marketClause = "";
    if (marketId != null) {
      params.push(marketId);
      marketClause = " AND mo.market_id = $2";
    }
    const queryWithSells = `SELECT mo.id AS outcome_id, mo.market_id, mo.description AS outcome_description,
              m.name AS market_name, m.status AS market_status,
              COALESCE(SUM(b.shares), 0) - COALESCE(sell_agg.sold, 0) AS shares
       FROM market_outcomes mo
       JOIN markets m ON m.id = mo.market_id
       LEFT JOIN bets b ON b.outcome_id = mo.id AND b.user_id = $1
       LEFT JOIN (
         SELECT outcome_id, SUM(shares) AS sold
         FROM sells WHERE user_id = $1 GROUP BY outcome_id
       ) sell_agg ON sell_agg.outcome_id = mo.id
       WHERE 1=1 ${marketClause}
       GROUP BY mo.id, mo.market_id, mo.description, m.name, m.status, sell_agg.sold
       HAVING (COALESCE(SUM(b.shares), 0) - COALESCE(sell_agg.sold, 0)) > 0
       ORDER BY mo.market_id, mo.id`;
    const queryWithoutSells = `SELECT mo.id AS outcome_id, mo.market_id, mo.description AS outcome_description,
              m.name AS market_name, m.status AS market_status,
              COALESCE(SUM(b.shares), 0) AS shares
       FROM market_outcomes mo
       JOIN markets m ON m.id = mo.market_id
       LEFT JOIN bets b ON b.outcome_id = mo.id AND b.user_id = $1
       WHERE 1=1 ${marketClause}
       GROUP BY mo.id, mo.market_id, mo.description, m.name, m.status
       HAVING COALESCE(SUM(b.shares), 0) > 0
       ORDER BY mo.market_id, mo.id`;
    try {
      const result = await pool.query(queryWithSells, params);
      return result.rows.map((r) => ({
        outcome_id: r.outcome_id,
        market_id: r.market_id,
        market_name: r.market_name,
        market_status: r.market_status,
        outcome_description: r.outcome_description,
        shares: Math.round(parseFloat(r.shares) * 1e4) / 1e4,
      }));
    } catch (err) {
      if (err.code === "42P01" || (err.message && err.message.includes("sells"))) {
        const result = await pool.query(queryWithoutSells, params);
        return result.rows.map((r) => ({
          outcome_id: r.outcome_id,
          market_id: r.market_id,
          market_name: r.market_name,
          market_status: r.market_status,
          outcome_description: r.outcome_description,
          shares: Math.round(parseFloat(r.shares) * 1e4) / 1e4,
        }));
      }
      throw err;
    }
  },
};

module.exports = usersService;
