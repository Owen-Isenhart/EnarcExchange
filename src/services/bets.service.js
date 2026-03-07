const pool = require("../config/db");
const lmsrService = require("./lmsr.service");

const betsService = {
  getAllBets: async (limit, offset) => {
    const bets = await pool.query(
      `SELECT b.*, u.username, mo.description as outcome_description 
       FROM bets b 
       JOIN users u ON b.user_id = u.id 
       JOIN market_outcomes mo ON b.outcome_id = mo.id 
       ORDER BY b.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM bets");
    return {
      rows: bets.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  getBetById: async (id) => {
    const result = await pool.query(
      `SELECT b.*, u.username, mo.description as outcome_description 
       FROM bets b 
       JOIN users u ON b.user_id = u.id 
       JOIN market_outcomes mo ON b.outcome_id = mo.id 
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  getUserBets: async (userId, limit, offset) => {
    const bets = await pool.query(
      `SELECT b.*, u.username, mo.description as outcome_description 
       FROM bets b 
       JOIN users u ON b.user_id = u.id 
       JOIN market_outcomes mo ON b.outcome_id = mo.id 
       WHERE b.user_id = $1 
       ORDER BY b.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM bets WHERE user_id = $1",
      [userId]
    );

    return {
      rows: bets.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  getMarketBets: async (marketId, limit, offset) => {
    const bets = await pool.query(
      `SELECT b.*, u.username, mo.description as outcome_description 
       FROM bets b 
       JOIN users u ON b.user_id = u.id 
       JOIN market_outcomes mo ON b.outcome_id = mo.id 
       WHERE mo.market_id = $1 
       ORDER BY b.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [marketId, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM bets b 
       JOIN market_outcomes mo ON b.outcome_id = mo.id 
       WHERE mo.market_id = $1`,
      [marketId]
    );

    return {
      rows: bets.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  createBet: async (userId, outcomeId, amount) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check user has sufficient tokens
      const userResult = await client.query(
        "SELECT token_balance FROM users WHERE id = $1",
        [userId]
      );

      if (userResult.rows.length === 0) {
        await client.query("ROLLBACK");
        client.release();
        throw new Error("User not found");
      }

      const user = userResult.rows[0];
      if (user.token_balance < amount) {
        await client.query("ROLLBACK");
        client.release();
        throw new Error("Insufficient token balance");
      }

      const outcomeResult = await client.query(
        `SELECT o.id, m.id as market_id, m.status 
         FROM market_outcomes o 
         JOIN markets m ON o.market_id = m.id 
         WHERE o.id = $1`,
        [outcomeId]
      );

      if (outcomeResult.rows.length === 0) {
        await client.query("ROLLBACK");
        client.release();
        throw new Error("Outcome not found");
      }

      const outcome = outcomeResult.rows[0];

      if (outcome.status !== "open") {
        await client.query("ROLLBACK");
        client.release();
        throw new Error("Market is not open for betting");
      }

      const lmsrResult = await lmsrService.applyBetAndRecordPrices(
        outcome.market_id,
        outcomeId,
        amount,
        client
      );
      const { shares } = lmsrResult;

      const betResult = await client.query(
        `INSERT INTO bets (user_id, outcome_id, amount, shares)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, outcomeId, amount, shares]
      );

      await client.query(
        "UPDATE users SET token_balance = token_balance - $1 WHERE id = $2",
        [amount, userId]
      );

      await client.query(
        `INSERT INTO transactions (user_id, amount, reason)
         VALUES ($1, $2, $3)`,
        [userId, -amount, `Bet placed on outcome ${outcomeId}`]
      );

      await client.query("COMMIT");
      return {
        bet: betResult.rows[0],
        marketId: outcome.market_id,
        newPricesByOutcomeId: lmsrResult.newPricesByOutcomeId,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  outcomeExists: async (outcomeId) => {
    const result = await pool.query(
      "SELECT id FROM market_outcomes WHERE id = $1",
      [outcomeId]
    );
    return result.rows.length > 0;
  },

  /** LMSR sell: user sells shares back to market. Position = SUM(bets.shares) - SUM(sells.shares). */
  createSell: async (userId, outcomeId, shares) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const outcomeResult = await client.query(
        `SELECT o.id, m.id as market_id, m.status FROM market_outcomes o
         JOIN markets m ON o.market_id = m.id WHERE o.id = $1`,
        [outcomeId]
      );
      if (outcomeResult.rows.length === 0) {
        await client.query("ROLLBACK");
        client.release();
        throw new Error("Outcome not found");
      }
      const { market_id: marketId, status } = outcomeResult.rows[0];
      if (status !== "open") {
        await client.query("ROLLBACK");
        client.release();
        throw new Error("Market is not open for selling");
      }

      const posResult = await client.query(
        `SELECT COALESCE(SUM(b.shares), 0) - COALESCE((SELECT SUM(s.shares) FROM sells s WHERE s.user_id = $1 AND s.outcome_id = $2), 0) AS position
         FROM bets b WHERE b.user_id = $1 AND b.outcome_id = $2`,
        [userId, outcomeId]
      );
      const position = parseFloat(posResult.rows[0]?.position ?? 0) || 0;
      if (shares <= 0 || shares > position) {
        await client.query("ROLLBACK");
        client.release();
        throw new Error("Insufficient shares to sell");
      }

      const lmsrResult = await lmsrService.applySellAndRecordPrices(marketId, outcomeId, shares, client);
      const { tokensReceived, newPricesByOutcomeId } = lmsrResult;

      const sellResult = await client.query(
        `INSERT INTO sells (user_id, outcome_id, shares, tokens_received)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, outcomeId, shares, tokensReceived]
      );

      await client.query(
        "UPDATE users SET token_balance = token_balance + $1 WHERE id = $2",
        [tokensReceived, userId]
      );
      await client.query(
        `INSERT INTO transactions (user_id, amount, reason) VALUES ($1, $2, $3)`,
        [userId, tokensReceived, `Sold ${shares} shares of outcome ${outcomeId}`]
      );

      await client.query("COMMIT");
      return {
        sell: sellResult.rows[0],
        marketId,
        newPricesByOutcomeId,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = betsService;
