const validators = require("../utils/validators");
const { getPaginationParams, getPaginationResponse } = require("../utils/pagination");
const transactionsService = require("../services/transactions.service");

const getTransactions = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await transactionsService.getAllTransactions(limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getTransactionById = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid transaction ID" });
  }

  try {
    const transaction = await transactionsService.getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getUserTransactions = async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await transactionsService.getUserTransactions(userId, limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const createTransaction = async (req, res) => {
  const { user_id, amount, reason } = req.body;

  if (!user_id || !Number.isInteger(user_id) || user_id <= 0) {
    return res.status(400).json({ error: "Valid user_id is required" });
  }

  if (typeof amount !== "number" || !Number.isInteger(amount)) {
    return res.status(400).json({ error: "amount must be an integer" });
  }

  if (!validators.nonEmptyString(reason)) {
    return res.status(400).json({ error: "reason is required" });
  }

  if (reason.length < 3 || reason.length > 200) {
    return res.status(400).json({
      error: "reason must be between 3 and 200 characters",
    });
  }

  try {
    const userExists = await transactionsService.userExists(user_id);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const transaction = await transactionsService.createTransaction(user_id, amount, reason);
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating transaction" });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  getUserTransactions,
  createTransaction,
};