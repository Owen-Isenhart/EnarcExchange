const validators = require("../utils/validators");
const { getPaginationParams, getPaginationResponse } = require("../utils/pagination");
const betsService = require("../services/bets.service");

const getBets = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await betsService.getAllBets(limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getBetById = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid bet ID" });
  }

  try {
    const bet = await betsService.getBetById(id);

    if (!bet) {
      return res.status(404).json({ error: "Bet not found" });
    }

    res.status(200).json(bet);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getUserBets = async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await betsService.getUserBets(userId, limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getMarketBets = async (req, res) => {
  const marketId = parseInt(req.params.marketId);

  if (!Number.isInteger(marketId) || marketId <= 0) {
    return res.status(400).json({ error: "Invalid market ID" });
  }

  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await betsService.getMarketBets(marketId, limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const createBet = async (req, res) => {
  const userId = req.user.id;
  const { outcome_id, amount } = req.body;

  if (!outcome_id || !Number.isInteger(outcome_id) || outcome_id <= 0) {
    return res.status(400).json({ error: "Valid outcome_id is required" });
  }

  if (!validators.positiveInteger(amount)) {
    return res.status(400).json({
      error: "amount must be a positive integer",
    });
  }

  try {
    const result = await betsService.createBet(userId, outcome_id, amount);
    const io = req.app?.get("io");
    if (io) {
      io.to(`market:${result.marketId}`).emit("market:prices", {
        market_id: result.marketId,
        prices: result.newPricesByOutcomeId,
      });
    }
    res.status(201).json({
      ...result.bet,
      market_id: result.marketId,
      new_prices: result.newPricesByOutcomeId,
    });
  } catch (err) {
    console.error("Create bet error:", err);
    if (err.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }
    if (err.message === "Insufficient token balance") {
      return res.status(400).json({ error: "Insufficient token balance" });
    }
    if (err.message === "Outcome not found") {
      return res.status(404).json({ error: "Outcome not found" });
    }
    if (err.message === "Market is not open for betting") {
      return res.status(400).json({ error: "Cannot place bets on a closed or resolved market" });
    }
    if (err.message === "Cost amount too small to buy any shares") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Error creating bet" });
  }
};

const createSell = async (req, res) => {
  const userId = req.user.id;
  const { outcome_id: outcomeId, shares } = req.body;

  if (!outcomeId || !Number.isInteger(outcomeId) || outcomeId <= 0) {
    return res.status(400).json({ error: "Valid outcome_id is required" });
  }
  const sharesNum = typeof shares === "number" ? shares : parseFloat(shares);
  if (!Number.isFinite(sharesNum) || sharesNum <= 0) {
    return res.status(400).json({ error: "shares must be a positive number" });
  }

  try {
    const result = await betsService.createSell(userId, outcomeId, sharesNum);
    const io = req.app?.get("io");
    if (io) {
      io.to(`market:${result.marketId}`).emit("market:prices", {
        market_id: result.marketId,
        prices: result.newPricesByOutcomeId,
      });
    }
    res.status(201).json({
      ...result.sell,
      market_id: result.marketId,
      new_prices: result.newPricesByOutcomeId,
    });
  } catch (err) {
    if (err.message === "Outcome not found") {
      return res.status(404).json({ error: "Outcome not found" });
    }
    if (err.message === "Market is not open for selling") {
      return res.status(400).json({ error: "Market is not open for selling" });
    }
    if (err.message === "Insufficient shares to sell") {
      return res.status(400).json({ error: "Insufficient shares to sell" });
    }
    if (err.message === "Invalid shares to sell" || err.message === "Sell would yield zero tokens") {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Error selling shares" });
  }
};

module.exports = {
  getBets,
  getBetById,
  getUserBets,
  getMarketBets,
  createBet,
  createSell,
};