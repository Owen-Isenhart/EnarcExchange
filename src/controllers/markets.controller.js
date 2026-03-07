const validators = require("../utils/validators");
const { getPaginationParams, getPaginationResponse } = require("../utils/pagination");
const marketsService = require("../services/markets.service");
const lmsrService = require("../services/lmsr.service");

const getMarkets = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await marketsService.getAllMarkets(limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error("getMarkets error:", err.message);
    const message = process.env.NODE_ENV === "production" ? "Server error" : err.message;
    res.status(500).json({ error: message });
  }
};

const getMarketById = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid market ID" });
  }

  try {
    const market = await marketsService.getMarketById(id);

    if (!market) {
      return res.status(404).json({ error: "Market not found" });
    }

    res.status(200).json(market);
  } catch (err) {
    console.error("getMarketById error:", err.message);
    const message = process.env.NODE_ENV === "production" ? "Server error" : err.message;
    res.status(500).json({ error: message });
  }
};

const getMarketPrices = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid market ID" });
  }
  try {
    const prices = await lmsrService.getMarketPrices(id);
    if (!prices) return res.status(404).json({ error: "Market not found" });
    res.status(200).json(prices);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getMarketQuote = async (req, res) => {
  const id = parseInt(req.params.id);
  const outcomeId = parseInt(req.query.outcome_id);
  const amount = req.query.amount != null ? parseFloat(req.query.amount) : null;
  const shares = req.query.shares != null ? parseFloat(req.query.shares) : null;
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid market ID" });
  }
  if (!Number.isInteger(outcomeId) || outcomeId <= 0) {
    return res.status(400).json({ error: "Query outcome_id is required and must be a positive integer" });
  }
  if (shares != null && Number.isFinite(shares) && shares > 0) {
    try {
      const quote = await lmsrService.getQuoteByShares(id, outcomeId, shares);
      if (!quote) return res.status(404).json({ error: "Market or outcome not found, or market not open" });
      return res.status(200).json(quote);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Server error" });
    }
  }
  if (amount == null || !Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({ error: "Query amount (tokens) or shares is required and must be positive" });
  }
  try {
    const quote = await lmsrService.getQuote(id, outcomeId, amount);
    if (!quote) return res.status(404).json({ error: "Market or outcome not found, or market not open" });
    res.status(200).json(quote);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const createMarket = async (req, res) => {
  const { name, description, start_time, end_time, liquidity_parameter } = req.body;
  const created_by = req.user.id;

  if (!validators.nonEmptyString(name)) {
    return res.status(400).json({ error: "Market name is required" });
  }

  if (name.length < 3 || name.length > 200) {
    return res.status(400).json({
      error: "Market name must be between 3 and 200 characters",
    });
  }

  if (description && !validators.maxLength(description, 1000)) {
    return res.status(400).json({
      error: "Market description cannot exceed 1000 characters",
    });
  }

  if (!start_time || !end_time) {
    return res.status(400).json({
      error: "start_time and end_time are required",
    });
  }

  const startTime = new Date(start_time);
  const endTime = new Date(end_time);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return res.status(400).json({
      error: "start_time and end_time must be valid ISO 8601 dates",
    });
  }

  if (endTime <= startTime) {
    return res.status(400).json({
      error: "end_time must be after start_time",
    });
  }

  if (liquidity_parameter !== undefined && liquidity_parameter !== null && !validators.positiveNumber(liquidity_parameter)) {
    return res.status(400).json({
      error: "liquidity_parameter must be a positive number (e.g. 100 for LMSR)",
    });
  }

  try {
    const market = await marketsService.createMarket(
      name,
      description,
      created_by,
      startTime,
      endTime,
      liquidity_parameter
    );
    res.status(201).json(market);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating market" });
  }
};

const updateMarket = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description, status } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid market ID" });
  }

  try {
    const existing = await marketsService.getMarketById(id);
    if (!existing) {
      return res.status(404).json({ error: "Market not found" });
    }

    if (name && !validators.nonEmptyString(name)) {
      return res.status(400).json({ error: "Market name cannot be empty" });
    }

    if (name && (name.length < 3 || name.length > 200)) {
      return res.status(400).json({
        error: "Market name must be between 3 and 200 characters",
      });
    }

    if (description && !validators.maxLength(description, 1000)) {
      return res.status(400).json({
        error: "Market description cannot exceed 1000 characters",
      });
    }

    if (status && !["open", "closed", "resolved"].includes(status)) {
      return res.status(400).json({
        error: "Status must be one of: open, closed, resolved",
      });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const result = await marketsService.updateMarket(id, updateFields);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating market" });
  }
};

const deleteMarket = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid market ID" });
  }

  try {
    const result = await marketsService.deleteMarket(id);

    if (!result) {
      return res.status(404).json({ error: "Market not found" });
    }

    res.status(200).json({ message: "Market deleted successfully", id: result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting market" });
  }
};

const resolveMarket = async (req, res) => {
  const id = parseInt(req.params.id);
  const { winning_outcome_id: winningOutcomeId } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid market ID" });
  }
  if (!Number.isInteger(winningOutcomeId) || winningOutcomeId <= 0) {
    return res.status(400).json({ error: "Body must include winning_outcome_id (positive integer)" });
  }

  try {
    const result = await marketsService.resolveMarket(id, winningOutcomeId);
    if (!result) {
      return res.status(404).json({ error: "Market not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Market already resolved") {
      return res.status(400).json({ error: "Market already resolved" });
    }
    if (err.message === "Winning outcome does not belong to this market") {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Error resolving market" });
  }
};

const seedMarket = async (req, res) => {
  const id = parseInt(req.params.id);
  const { quantities } = req.body; // array [q0, q1, ...] or object { outcome_id: quantity }
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid market ID" });
  }
  if (quantities === undefined || typeof quantities !== "object") {
    return res.status(400).json({ error: "Body must include quantities (array or object by outcome_id)" });
  }
  try {
    const result = await marketsService.seedMarket(id, quantities);
    if (!result) return res.status(404).json({ error: "Market not found" });
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Market must be open to seed" || err.message === "Cannot seed market that already has bets" || err.message === "Market has no outcomes") {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Error seeding market" });
  }
};

module.exports = {
  getMarkets,
  getMarketById,
  getMarketPrices,
  getMarketQuote,
  createMarket,
  updateMarket,
  deleteMarket,
  resolveMarket,
  seedMarket,
};