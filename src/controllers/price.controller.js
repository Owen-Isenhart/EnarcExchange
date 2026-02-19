const validators = require("../utils/validators");
const { getPaginationParams, getPaginationResponse } = require("../utils/pagination");
const pricesService = require("../services/prices.service");

const getPrices = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await pricesService.getAllPrices(limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getPriceById = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid price ID" });
  }

  try {
    const price = await pricesService.getPriceById(id);

    if (!price) {
      return res.status(404).json({ error: "Price record not found" });
    }

    res.status(200).json(price);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getOutcomePriceHistory = async (req, res) => {
  const outcomeId = parseInt(req.params.outcomeId);

  if (!Number.isInteger(outcomeId) || outcomeId <= 0) {
    return res.status(400).json({ error: "Invalid outcome ID" });
  }

  try {
    const { page, limit, offset } = getPaginationParams(req);

    const outcomeExists = await pricesService.outcomeExists(outcomeId);
    if (!outcomeExists) {
      return res.status(404).json({ error: "Outcome not found" });
    }

    const { rows, total } = await pricesService.getOutcomePriceHistory(outcomeId, limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getLatestPrices = async (req, res) => {
  try {
    const prices = await pricesService.getLatestPrices();
    res.status(200).json(prices);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const createPrice = async (req, res) => {
  const { outcome_id, price } = req.body;

  if (!outcome_id || !Number.isInteger(outcome_id) || outcome_id <= 0) {
    return res.status(400).json({ error: "Valid outcome_id is required" });
  }

  if (price === undefined || price === null || !validators.probability(price)) {
    return res.status(400).json({
      error: "price must be a number between 0 and 1",
    });
  }

  try {
    const outcomeExists = await pricesService.outcomeExists(outcome_id);
    if (!outcomeExists) {
      return res.status(404).json({ error: "Outcome not found" });
    }

    const priceRecord = await pricesService.createPrice(outcome_id, price);
    res.status(201).json(priceRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating price record" });
  }
};

const updatePrice = async (req, res) => {
  const id = parseInt(req.params.id);
  const { price } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid price ID" });
  }

  if (price === undefined || price === null || !validators.probability(price)) {
    return res.status(400).json({
      error: "price must be a number between 0 and 1",
    });
  }

  try {
    const priceExists = await pricesService.priceExists(id);
    if (!priceExists) {
      return res.status(404).json({ error: "Price record not found" });
    }

    const result = await pricesService.updatePrice(id, price);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating price" });
  }
};

const deletePrice = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid price ID" });
  }

  try {
    const result = await pricesService.deletePrice(id);

    if (!result) {
      return res.status(404).json({ error: "Price record not found" });
    }

    res.status(200).json({ message: "Price record deleted successfully", id: result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting price record" });
  }
};

module.exports = {
  getPrices,
  getPriceById,
  getOutcomePriceHistory,
  getLatestPrices,
  createPrice,
  updatePrice,
  deletePrice,
};