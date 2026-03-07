const { getPaginationParams, getPaginationResponse } = require("../utils/pagination");
const usersService = require("../services/users.service");

const getMyPositions = async (req, res) => {
  const userId = req.user.id;
  const marketId = req.query.market_id ? parseInt(req.query.market_id) : null;
  if (req.query.market_id != null && (!Number.isInteger(marketId) || marketId <= 0)) {
    return res.status(400).json({ error: "Invalid market_id query" });
  }
  try {
    const positions = await usersService.getPositions(userId, marketId || null);
    res.status(200).json({ positions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getPositionsByUserId = async (req, res) => {
  const userId = parseInt(req.params.userId);
  const marketId = req.query.market_id ? parseInt(req.query.market_id) : null;
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  if (req.query.market_id != null && (!Number.isInteger(marketId) || marketId <= 0)) {
    return res.status(400).json({ error: "Invalid market_id query" });
  }

  // Users can only view their own positions unless they're admin
  if (req.user.id !== userId && !req.user.is_admin) {
    return res.status(403).json({ error: "You can only view your own positions" });
  }

  try {
    const positions = await usersService.getPositions(userId, marketId || null);
    res.status(200).json({ positions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { rows, total } = await usersService.getAllUsers(limit, offset);
    res.status(200).json(getPaginationResponse(rows, total, page, limit));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getUserById = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const user = await usersService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const user = await usersService.getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getUserStats = async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const stats = await usersService.getUserStats(userId);

    if (!stats) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  getUserByUsername,
  getUserStats,
  getMyPositions,
  getPositionsByUserId,
};