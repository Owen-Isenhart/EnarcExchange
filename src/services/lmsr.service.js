const marketsService = require("./markets.service");
const outcomesService = require("./outcomes.service");
const pricesService = require("./prices.service");
const { marginalPrices, sharesForCost } = require("../utils/lmsr");
const pool = require("../config/db");

const lmsrService = {
  /**
   * Get current LMSR-derived prices for a market (from outcome quantities + b).
   * Returns { market_id, liquidity_parameter, outcomes: [{ outcome_id, description, quantity, price }] }
   */
  getMarketPrices: async (marketId) => {
    const data = await marketsService.getMarketWithOutcomesForLmsr(marketId);
    if (!data || !data.outcomes.length) return null;
    const b = data.liquidity_parameter;
    const q = data.outcomes.map((o) => o.quantity);
    const prices = marginalPrices(q, b);
    return {
      market_id: data.id,
      liquidity_parameter: b,
      status: data.status,
      outcomes: data.outcomes.map((o, i) => ({
        outcome_id: o.id,
        description: o.description,
        quantity: o.quantity,
        price: Math.round(prices[i] * 1e6) / 1e6,
      })),
    };
  },

  /**
   * Quote: how many shares for outcome can be bought for costAmount tokens, and new prices after.
   */
  getQuote: async (marketId, outcomeId, costAmount) => {
    const data = await marketsService.getMarketWithOutcomesForLmsr(marketId);
    if (!data || data.status !== "open") return null;
    const outcomeIndex = data.outcomes.findIndex((o) => o.id === outcomeId);
    if (outcomeIndex === -1) return null;
    const q = data.outcomes.map((o) => o.quantity);
    const b = data.liquidity_parameter;
    const { shares, cost } = sharesForCost(q, b, outcomeIndex, costAmount);
    const qNew = q.slice();
    qNew[outcomeIndex] += shares;
    const newPrices = marginalPrices(qNew, b);
    return {
      outcome_id: outcomeId,
      cost_amount: cost,
      shares,
      current_prices: data.outcomes.map((o, i) => ({ outcome_id: o.id, price: marginalPrices(q, b)[i] })),
      new_prices: data.outcomes.map((o, i) => ({ outcome_id: o.id, price: Math.round(newPrices[i] * 1e6) / 1e6 })),
    };
  },

  /**
   * Apply a bet: update outcome quantities, append price_history for each outcome, return bet payload and new prices.
   * Does NOT deduct user balance or insert bet/transaction — caller (bets.service) does that.
   * Returns { shares, newPricesByOutcomeId } or throws.
   */
  applyBetAndRecordPrices: async (marketId, outcomeId, costAmount) => {
    const data = await marketsService.getMarketWithOutcomesForLmsr(marketId);
    if (!data || data.status !== "open") throw new Error("Market is not open for betting");
    const outcomeIndex = data.outcomes.findIndex((o) => o.id === outcomeId);
    if (outcomeIndex === -1) throw new Error("Outcome not found");
    const q = data.outcomes.map((o) => o.quantity);
    const b = data.liquidity_parameter;
    const { shares, cost } = sharesForCost(q, b, outcomeIndex, costAmount);
    if (shares <= 0) throw new Error("Cost amount too small to buy any shares");

    const client = await pool.connect();
    try {
      const newQ = q.slice();
      newQ[outcomeIndex] += shares;
      const newPrices = marginalPrices(newQ, b);

      await client.query("BEGIN");

      await client.query(
        "UPDATE market_outcomes SET quantity = $1 WHERE id = $2",
        [newQ[outcomeIndex], outcomeId]
      );

      for (let i = 0; i < data.outcomes.length; i++) {
        await client.query(
          "INSERT INTO price_history (outcome_id, price) VALUES ($1, $2)",
          [data.outcomes[i].id, Math.round(newPrices[i] * 1e6) / 1e6]
        );
      }

      await client.query("COMMIT");

      const newPricesByOutcomeId = {};
      data.outcomes.forEach((o, i) => {
        newPricesByOutcomeId[o.id] = Math.round(newPrices[i] * 1e6) / 1e6;
      });

      return {
        shares,
        costUsed: cost,
        newPricesByOutcomeId,
        marketId,
        outcomeIds: data.outcomes.map((o) => o.id),
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = lmsrService;
