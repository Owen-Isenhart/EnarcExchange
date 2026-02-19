const pool = require("../config/db");

const pricesService = {
  getAllPrices: async (limit, offset) => {
    const prices = await pool.query(
      `SELECT ph.*, mo.description as outcome_description 
       FROM price_history ph
       JOIN market_outcomes mo ON ph.outcome_id = mo.id
       ORDER BY ph.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM price_history");
    return {
      rows: prices.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  getPriceById: async (id) => {
    const result = await pool.query(
      `SELECT ph.*, mo.description as outcome_description 
       FROM price_history ph
       JOIN market_outcomes mo ON ph.outcome_id = mo.id
       WHERE ph.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  getOutcomePriceHistory: async (outcomeId, limit, offset) => {
    const prices = await pool.query(
      `SELECT * FROM price_history
       WHERE outcome_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [outcomeId, limit, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM price_history WHERE outcome_id = $1",
      [outcomeId]
    );

    return {
      rows: prices.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  getLatestPrices: async () => {
    const result = await pool.query(
      `SELECT DISTINCT ON (outcome_id) outcome_id, price, created_at 
       FROM price_history
       ORDER BY outcome_id, created_at DESC`
    );
    return result.rows;
  },

  createPrice: async (outcomeId, price) => {
    const result = await pool.query(
      "INSERT INTO price_history (outcome_id, price) VALUES ($1, $2) RETURNING *",
      [outcomeId, price]
    );
    return result.rows[0];
  },

  updatePrice: async (id, price) => {
    const result = await pool.query(
      "UPDATE price_history SET price = $1 WHERE id = $2 RETURNING *",
      [price, id]
    );
    return result.rows[0] || null;
  },

  deletePrice: async (id) => {
    const result = await pool.query(
      "DELETE FROM price_history WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0] || null;
  },

  outcomeExists: async (outcomeId) => {
    const result = await pool.query(
      "SELECT id FROM market_outcomes WHERE id = $1",
      [outcomeId]
    );
    return result.rows.length > 0;
  },

  priceExists: async (id) => {
    const result = await pool.query(
      "SELECT id FROM price_history WHERE id = $1",
      [id]
    );
    return result.rows.length > 0;
  },
};

module.exports = pricesService;
