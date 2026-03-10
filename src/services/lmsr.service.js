const marketsService = require("./markets.service");
const outcomesService = require("./outcomes.service");
const pricesService = require("./prices.service");
const { marginalPrices, sharesForCost, costToBuy, costToSell, Decimal } = require("../utils/lmsr");
const pool = require("../config/db");

/**
 * Convert Decimal or number to 4 decimal places for API responses.
 * Also converts strings returned from DB into numbers.
 */
const round4 = (x) => {
  if (x instanceof Decimal || typeof x === "object") {
    x = x.toNumber ? x.toNumber() : parseFloat(x);
  }
  return Math.round(x * 1e4) / 1e4;
};

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
        quantity: round4(o.quantity),
        price: round4(prices[i]),
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
    const qNew = q.map((qi) => new Decimal(qi || 0));
    qNew[outcomeIndex] = qNew[outcomeIndex].plus(shares);
    const newPrices = marginalPrices(qNew, b);
    const currentPrices = marginalPrices(q, b);
    return {
      outcome_id: outcomeId,
      cost_amount: round4(cost),
      shares: round4(shares),
      current_prices: data.outcomes.map((o, i) => ({ outcome_id: o.id, price: round4(currentPrices[i]) })),
      new_prices: data.outcomes.map((o, i) => ({ outcome_id: o.id, price: round4(newPrices[i]) })),
    };
  },

  /** Quote by shares: cost to buy exactly `shares` of outcome, and new prices after. */
  getQuoteByShares: async (marketId, outcomeId, sharesAmount) => {
    const data = await marketsService.getMarketWithOutcomesForLmsr(marketId);
    if (!data || data.status !== "open") return null;
    const outcomeIndex = data.outcomes.findIndex((o) => o.id === outcomeId);
    if (outcomeIndex === -1) return null;
    if (sharesAmount <= 0) return null;
    const q = data.outcomes.map((o) => o.quantity);
    const b = data.liquidity_parameter;
    const costAmount = costToBuy(q, b, outcomeIndex, sharesAmount);
    const qNew = q.map((qi) => new Decimal(qi || 0));
    qNew[outcomeIndex] = qNew[outcomeIndex].plus(sharesAmount);
    const newPrices = marginalPrices(qNew, b);
    const currentPrices = marginalPrices(q, b);
    return {
      outcome_id: outcomeId,
      shares: round4(sharesAmount),
      cost_amount: round4(costAmount),
      current_prices: data.outcomes.map((o, i) => ({ outcome_id: o.id, price: round4(currentPrices[i]) })),
      new_prices: data.outcomes.map((o, i) => ({ outcome_id: o.id, price: round4(newPrices[i]) })),
    };
  },

  /**
   * Apply a bet: update outcome quantities, append price_history for each outcome.
   * If `pgClient` is provided, uses it (caller owns transaction). Otherwise uses its own connection and transaction.
   * Returns { shares, costUsed, newPricesByOutcomeId, marketId, outcomeIds }.
   */
  applyBetAndRecordPrices: async (marketId, outcomeId, costAmount, pgClient = null) => {
    const data = await marketsService.getMarketWithOutcomesForLmsr(marketId);
    if (!data || data.status !== "open") throw new Error("Market is not open for betting");
    const outcomeIndex = data.outcomes.findIndex((o) => o.id === outcomeId);
    if (outcomeIndex === -1) throw new Error("Outcome not found");
    const q = data.outcomes.map((o) => o.quantity);
    const b = data.liquidity_parameter;
    const { shares, cost } = sharesForCost(q, b, outcomeIndex, costAmount);
    if (shares <= 0) throw new Error("Cost amount too small to buy any shares");

    const newQ = q.slice();
    newQ[outcomeIndex] = new Decimal(newQ[outcomeIndex] || 0).plus(shares);
    const newPrices = marginalPrices(newQ, b);
    const newPricesByOutcomeId = {};
    data.outcomes.forEach((o, i) => {
      newPricesByOutcomeId[o.id] = round4(newPrices[i]);
    });

    const run = async (client) => {
      await client.query(
        "UPDATE market_outcomes SET quantity = $1 WHERE id = $2",
        [newQ[outcomeIndex].toString(), outcomeId]
      );
      for (let i = 0; i < data.outcomes.length; i++) {
        await client.query(
          "INSERT INTO price_history (outcome_id, price) VALUES ($1, $2)",
          [data.outcomes[i].id, newPricesByOutcomeId[data.outcomes[i].id]]
        );
      }
    };

    if (pgClient) {
      await run(pgClient);
      return { 
        shares: shares.toString(), // Precise Decimal as string for storage
        sharesRounded: round4(shares), // Rounded for API
        costUsed: round4(cost), 
        newPricesByOutcomeId, 
        marketId, 
        outcomeIds: data.outcomes.map((o) => o.id) 
      };
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await run(client);
      await client.query("COMMIT");
      return { 
        shares: shares.toString(), // Precise Decimal as string for storage
        sharesRounded: round4(shares), // Rounded for API
        costUsed: round4(cost), 
        newPricesByOutcomeId, 
        marketId, 
        outcomeIds: data.outcomes.map((o) => o.id) 
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Apply a sell: decrease outcome quantity, credit user (tokens from costToSell), record price_history.
   * If pgClient provided, uses it. Returns { tokensReceived (Decimal), newPricesByOutcomeId, marketId }.
   * Note: tokensReceived is returned as a Decimal to preserve precision for storage.
   */
  applySellAndRecordPrices: async (marketId, outcomeId, shares, pgClient = null) => {
    const data = await marketsService.getMarketWithOutcomesForLmsr(marketId);
    if (!data || data.status !== "open") throw new Error("Market is not open for selling");
    const outcomeIndex = data.outcomes.findIndex((o) => o.id === outcomeId);
    if (outcomeIndex === -1) throw new Error("Outcome not found");
    const q = data.outcomes.map((o) => o.quantity);
    const b = data.liquidity_parameter;
    const currentQ = q[outcomeIndex] || 0;
    if (shares <= 0 || shares > currentQ) throw new Error("Invalid shares to sell");
    const costDelta = costToSell(q, b, outcomeIndex, shares); // negative = user receives
    
    // tokensReceived is a Decimal representing the exact payout (including fractions)
    const tokensReceived = costDelta.negated(); // Convert from cost (negative) to payout (positive)
    
    if (tokensReceived.lte(0)) throw new Error("Sell would yield zero tokens");

    const newQ = q.slice();
    newQ[outcomeIndex] = new Decimal(currentQ).minus(shares);
    const newPrices = marginalPrices(newQ, b);
    const newPricesByOutcomeId = {};
    data.outcomes.forEach((o, i) => {
      newPricesByOutcomeId[o.id] = round4(newPrices[i]);
    });

    const run = async (client) => {
      await client.query(
        "UPDATE market_outcomes SET quantity = $1 WHERE id = $2",
        [newQ[outcomeIndex].toString(), outcomeId]
      );
      for (let i = 0; i < data.outcomes.length; i++) {
        await client.query(
          "INSERT INTO price_history (outcome_id, price) VALUES ($1, $2)",
          [data.outcomes[i].id, newPricesByOutcomeId[data.outcomes[i].id]]
        );
      }
    };

    if (pgClient) {
      await run(pgClient);
      return { tokensReceived, newPricesByOutcomeId, marketId };
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await run(client);
      await client.query("COMMIT");
      return { tokensReceived, newPricesByOutcomeId, marketId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = lmsrService;
