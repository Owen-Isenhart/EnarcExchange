const validators = require("../utils/validators");
const { getPaginationParams, getPaginationResponse } = require("../utils/pagination");
const outcomesService = require("../services/outcomes.service");

const getOutcomes = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await outcomesService.getAllOutcomes(limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getOutcomeById = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid outcome ID" });
  }

  try {
    const outcome = await outcomesService.getOutcomeById(id);

    if (!outcome) {
      return res.status(404).json({ error: "Outcome not found" });
    }

    res.status(200).json(outcome);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getMarketOutcomes = async (req, res) => {
  const marketId = parseInt(req.params.marketId);

  if (!Number.isInteger(marketId) || marketId <= 0) {
    return res.status(400).json({ error: "Invalid market ID" });
  }

  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await outcomesService.getMarketOutcomes(marketId, limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const createOutcome = async (req, res) => {
  const { market_id, description } = req.body;

  if (!market_id || !Number.isInteger(market_id) || market_id <= 0) {
    return res.status(400).json({ error: "Valid market_id is required" });
  }

  if (!validators.nonEmptyString(description)) {
    return res.status(400).json({ error: "description is required" });
  }

  if (description.length < 3 || description.length > 500) {
    return res.status(400).json({
      error: "description must be between 3 and 500 characters",
    });
  }

  try {
    const marketExists = await outcomesService.marketExists(market_id);
    if (!marketExists) {
      return res.status(404).json({ error: "Market not found" });
    }

    const outcome = await outcomesService.createOutcome(market_id, description);
    res.status(201).json(outcome);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating outcome" });
  }
};

const updateOutcome = async (req, res) => {
  const id = parseInt(req.params.id);
  const { description } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid outcome ID" });
  }

  if (!description || !validators.nonEmptyString(description)) {
    return res.status(400).json({ error: "description is required" });
  }

  if (description.length < 3 || description.length > 500) {
    return res.status(400).json({
      error: "description must be between 3 and 500 characters",
    });
  }

  try {
    const existing = await outcomesService.outcomeExists(id);
    if (!existing) {
      return res.status(404).json({ error: "Outcome not found" });
    }

    const result = await outcomesService.updateOutcome(id, description);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating outcome" });
  }
};

const deleteOutcome = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid outcome ID" });
  }

  try {
    const result = await outcomesService.deleteOutcome(id);

    if (!result) {
      return res.status(404).json({ error: "Outcome not found" });
    }

    res.status(200).json({ message: "Outcome deleted successfully", id: result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting outcome" });
  }
};


module.exports = {
  getOutcomes,
  getOutcomeById,
  getMarketOutcomes,
  createOutcome,
  updateOutcome,
  deleteOutcome,
};