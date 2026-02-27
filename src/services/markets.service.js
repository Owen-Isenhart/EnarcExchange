const pool = require("../config/db");

const marketsService = {
  getAllMarkets: async (limit, offset) => {
    const markets = await pool.query(
      `SELECT m.*, u.username as created_by_username 
       FROM markets m 
       JOIN users u ON m.created_by = u.id 
       ORDER BY m.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM markets");
    return {
      rows: markets.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  getMarketById: async (id) => {
    const result = await pool.query(
      `SELECT m.*, u.username as created_by_username 
       FROM markets m 
       JOIN users u ON m.created_by = u.id 
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  createMarket: async (name, description, createdBy, startTime, endTime, liquidityParameter) => {
    const result = await pool.query(
      `INSERT INTO markets (name, description, created_by, start_time, end_time, liquidity_parameter, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description || null, createdBy, startTime, endTime, liquidityParameter || 100.0, "open"]
    );
    return result.rows[0];
  },

  updateMarket: async (id, updateFields) => {
    let paramCount = 1;
    const values = [];
    const fields = [];

    if (updateFields.name) {
      fields.push(`name = $${paramCount}`);
      values.push(updateFields.name);
      paramCount++;
    }

    if (updateFields.description) {
      fields.push(`description = $${paramCount}`);
      values.push(updateFields.description);
      paramCount++;
    }

    if (updateFields.status) {
      fields.push(`status = $${paramCount}`);
      values.push(updateFields.status);
      paramCount++;
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const query = `UPDATE markets SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  deleteMarket: async (id) => {
    const result = await pool.query(
      "DELETE FROM markets WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0] || null;
  },

  marketExists: async (id) => {
    const result = await pool.query(
      "SELECT id FROM markets WHERE id = $1",
      [id]
    );
    return result.rows.length > 0;
  },

  getMarketStatus: async (id) => {
    const result = await pool.query(
      "SELECT status FROM markets WHERE id = $1",
      [id]
    );
    return result.rows[0]?.status || null;
  },

  /** For LMSR: market with outcomes and quantities (b, outcomes with id, description, quantity) */
  getMarketWithOutcomesForLmsr: async (marketId) => {
    const marketResult = await pool.query(
      "SELECT id, liquidity_parameter, status FROM markets WHERE id = $1",
      [marketId]
    );
    if (marketResult.rows.length === 0) return null;
    const outcomesResult = await pool.query(
      `SELECT id, description, COALESCE(quantity, 0) AS quantity
       FROM market_outcomes
       WHERE market_id = $1
       ORDER BY id`,
      [marketId]
    );
    return {
      ...marketResult.rows[0],
      liquidity_parameter: parseFloat(marketResult.rows[0].liquidity_parameter) || 100,
      outcomes: outcomesResult.rows.map((r) => ({
        id: r.id,
        description: r.description,
        quantity: parseFloat(r.quantity) || 0,
      })),
    };
  },
};

module.exports = marketsService;
