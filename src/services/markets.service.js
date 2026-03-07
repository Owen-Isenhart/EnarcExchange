const pool = require("../config/db");

const marketsService = {
  getAllMarkets: async (limit, offset) => {
    const markets = await pool.query(
      `SELECT m.id, m.name, m.description, m.created_by, m.liquidity_parameter, m.winning_outcome_id,
              m.start_time, m.end_time, m.status, m.created_at,
              COALESCE(u.username, '[deleted]') AS created_by_username
       FROM markets m
       LEFT JOIN users u ON m.created_by = u.id
       ORDER BY (CASE WHEN m.status = 'open' THEN 0 ELSE 1 END), m.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*)::int AS count FROM markets");
    const total = countResult.rows[0] ? countResult.rows[0].count : 0;
    return {
      rows: markets.rows,
      total: Number(total) || 0,
    };
  },

  getMarketById: async (id) => {
    const result = await pool.query(
      `SELECT m.id, m.name, m.description, m.created_by, m.liquidity_parameter, m.winning_outcome_id,
              m.start_time, m.end_time, m.status, m.created_at,
              COALESCE(u.username, '[deleted]') AS created_by_username
       FROM markets m
       LEFT JOIN users u ON m.created_by = u.id
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

  /**
   * Resolve market: set winning outcome and pay out winning bets (1 token per share).
   * Uses a single transaction. Fails if market not found, already resolved, or winning_outcome_id not in market.
   * @returns { market, winning_outcome_id, payouts: [{ bet_id, user_id, shares, payout_amount }] }
   */
  resolveMarket: async (marketId, winningOutcomeId) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const marketResult = await client.query(
        "SELECT id, status FROM markets WHERE id = $1 FOR UPDATE",
        [marketId]
      );
      if (marketResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }
      const market = marketResult.rows[0];
      if (market.status === "resolved") {
        await client.query("ROLLBACK");
        throw new Error("Market already resolved");
      }

      const outcomeResult = await client.query(
        "SELECT id FROM market_outcomes WHERE id = $1 AND market_id = $2",
        [winningOutcomeId, marketId]
      );
      if (outcomeResult.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new Error("Winning outcome does not belong to this market");
      }

      await client.query(
        "UPDATE markets SET status = $1, winning_outcome_id = $2 WHERE id = $3",
        ["resolved", winningOutcomeId, marketId]
      );

      const betsResult = await client.query(
        `SELECT id, user_id, shares FROM bets
         WHERE outcome_id = $1 AND (is_settled IS NOT TRUE OR is_settled = FALSE)`,
        [winningOutcomeId]
      );

      const payouts = [];

      // Process each winning bet
      for (const bet of betsResult.rows) {
        const shares = Number(bet.shares) || 0;
        if (shares <= 0) continue;

        // Store exact payout amount (with fractional tokens)
        await client.query(
          "UPDATE bets SET payout_amount = $1, is_settled = TRUE WHERE id = $2",
          [shares.toString(), bet.id]
        );

        // Add payout to user's token balance using PostgreSQL NUMERIC arithmetic
        // This preserves fractional tokens (e.g., 10.7 shares = 10.7 tokens)
        await client.query(
          "UPDATE users SET token_balance = token_balance + $1 WHERE id = $2",
          [shares.toString(), bet.user_id]
        );

        // Record transaction with precise amount
        await client.query(
          "INSERT INTO transactions (user_id, amount, reason) VALUES ($1, $2, $3)",
          [bet.user_id, shares.toString(), `Bet won (market ${marketId} resolved)`]
        );

        payouts.push({
          bet_id: bet.id,
          user_id: bet.user_id,
          shares: shares,
          payout_amount: shares,
        });
      }

      await client.query("COMMIT");
      return {
        market_id: marketId,
        winning_outcome_id: winningOutcomeId,
        payouts,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Seed initial liquidity (set outcome quantities). Admin only. Allowed only when market is open and has no bets.
   * quantities: array of numbers [q0, q1, ...] in outcome id order, or object { outcome_id: quantity }.
   */
  seedMarket: async (marketId, quantities) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const marketResult = await client.query(
        "SELECT id, status FROM markets WHERE id = $1 FOR UPDATE",
        [marketId]
      );
      if (marketResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }
      if (marketResult.rows[0].status !== "open") {
        await client.query("ROLLBACK");
        throw new Error("Market must be open to seed");
      }
      // Lock all outcomes for this market to prevent concurrent bets while seeding
      const outcomeLockResult = await client.query(
        `SELECT id FROM market_outcomes WHERE market_id = $1 FOR UPDATE`,
        [marketId]
      );

      const betCountResult = await client.query(
        `SELECT COUNT(*) AS c FROM bets b JOIN market_outcomes mo ON b.outcome_id = mo.id WHERE mo.market_id = $1`,
        [marketId]
      );
      if (parseInt(betCountResult.rows[0].c, 10) > 0) {
        await client.query("ROLLBACK");
        throw new Error("Cannot seed market that already has bets");
      }
      const outcomesResult = await client.query(
        "SELECT id FROM market_outcomes WHERE market_id = $1 ORDER BY id",
        [marketId]
      );
      const outcomes = outcomesResult.rows;
      if (outcomes.length === 0) {
        await client.query("ROLLBACK");
        throw new Error("Market has no outcomes");
      }
      const byId = Array.isArray(quantities)
        ? Object.fromEntries(outcomes.map((o, i) => [o.id, quantities[i] ?? 0]))
        : quantities;
      for (const o of outcomes) {
        const q = Number(byId[o.id]) || 0;
        await client.query("UPDATE market_outcomes SET quantity = $1 WHERE id = $2", [q, o.id]);
      }
      await client.query("COMMIT");
      return { market_id: marketId, outcome_quantities: byId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
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
