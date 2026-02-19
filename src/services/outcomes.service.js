const pool = require("../config/db");

const outcomesService = {
  getAllOutcomes: async (limit, offset) => {
    const outcomes = await pool.query(
      `SELECT mo.*, m.name as market_name 
       FROM market_outcomes mo
       JOIN markets m ON mo.market_id = m.id
       ORDER BY mo.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM market_outcomes");
    return {
      rows: outcomes.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  getOutcomeById: async (id) => {
    const result = await pool.query(
      `SELECT mo.*, m.name as market_name, COUNT(b.id) as total_bets, SUM(b.amount) as total_wagered
       FROM market_outcomes mo
       JOIN markets m ON mo.market_id = m.id
       LEFT JOIN bets b ON mo.id = b.outcome_id
       WHERE mo.id = $1
       GROUP BY mo.id, m.name`,
      [id]
    );
    return result.rows[0] || null;
  },

  getMarketOutcomes: async (marketId, limit, offset) => {
    const outcomes = await pool.query(
      `SELECT mo.*, COUNT(b.id) as total_bets, SUM(b.amount) as total_wagered
       FROM market_outcomes mo
       LEFT JOIN bets b ON mo.id = b.outcome_id
       WHERE mo.market_id = $1
       GROUP BY mo.id
       ORDER BY mo.created_at DESC
       LIMIT $2 OFFSET $3`,
      [marketId, limit, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM market_outcomes WHERE market_id = $1",
      [marketId]
    );

    return {
      rows: outcomes.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  createOutcome: async (marketId, description) => {
    const result = await pool.query(
      "INSERT INTO market_outcomes (market_id, description) VALUES ($1, $2) RETURNING *",
      [marketId, description]
    );
    return result.rows[0];
  },

  updateOutcome: async (id, description) => {
    const result = await pool.query(
      "UPDATE market_outcomes SET description = $1 WHERE id = $2 RETURNING *",
      [description, id]
    );
    return result.rows[0] || null;
  },

  deleteOutcome: async (id) => {
    const result = await pool.query(
      "DELETE FROM market_outcomes WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0] || null;
  },

  outcomeExists: async (id) => {
    const result = await pool.query(
      "SELECT id FROM market_outcomes WHERE id = $1",
      [id]
    );
    return result.rows.length > 0;
  },
};

module.exports = outcomesService;
