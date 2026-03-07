const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const asyncHandler = require("../utils/asyncHandler");
const {
  getMarkets,
  getMarketById,
  getMarketPrices,
  getMarketQuote,
  createMarket,
  updateMarket,
  deleteMarket,
  resolveMarket,
  seedMarket,
} = require("../controllers/markets.controller");


const router = Router();

/**
 * #swagger.tags = ['Markets']
 * #swagger.summary = 'Get all markets'
 * #swagger.description = 'Retrieve paginated list of all markets'
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'Markets retrieved successfully' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/", asyncHandler(getMarkets));

/**
 * #swagger.tags = ['Markets']
 * #swagger.summary = 'Create new market'
 * #swagger.description = 'Create a new prediction market (Admin only)'
 * #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/MarketCreate' } }
 * #swagger.responses[201] = { description: 'Market created successfully' }
 * #swagger.responses[400] = { description: 'Invalid input' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.post("/", authenticate, requireAdmin, asyncHandler(createMarket));

/**
 * #swagger.tags = ['Markets']
 * #swagger.summary = 'Get LMSR prices for market'
 * #swagger.description = 'Current marginal prices (probabilities) from LMSR for all outcomes'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Market ID', example: 1 }
 * #swagger.responses[200] = { description: 'LMSR prices' }
 * #swagger.responses[404] = { description: 'Market not found' }
 */
router.get("/:id/prices", asyncHandler(getMarketPrices));

/**
 * #swagger.tags = ['Markets']
 * #swagger.summary = 'Get quote for buying outcome with tokens'
 * #swagger.description = 'Returns shares and new prices for spending amount tokens on outcome_id'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Market ID' }
 * #swagger.parameters['outcome_id'] = { in: 'query', required: true, description: 'Outcome ID' }
 * #swagger.parameters['amount'] = { in: 'query', required: true, description: 'Token amount to spend' }
 */
router.get("/:id/quote", asyncHandler(getMarketQuote));

/**
 * #swagger.tags = ['Markets']
 * #swagger.summary = 'Resolve market and pay out winning bets'
 * #swagger.description = 'Admin only. Sets market resolved, pays 1 token per share to bets on winning_outcome_id.'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Market ID' }
 * #swagger.parameters['body'] = { in: 'body', required: true, schema: { winning_outcome_id: 1 } }
 */
router.post("/:id/resolve", authenticate, requireAdmin, asyncHandler(resolveMarket));

/**
 * #swagger.tags = ['Markets']
 * #swagger.summary = 'Seed initial liquidity (LMSR quantities)'
 * #swagger.description = 'Admin only. Body: { quantities: [q0, q1, ...] } or { quantities: { outcome_id: q } }. Market must be open and have no bets.'
 */
router.post("/:id/seed", authenticate, requireAdmin, asyncHandler(seedMarket));

/**
 * #swagger.tags = ['Markets']
 * #swagger.summary = 'Get market by ID'
 * #swagger.description = 'Retrieve a specific market by ID'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Market ID', example: 1 }
 * #swagger.responses[200] = { description: 'Market found' }
 * #swagger.responses[400] = { description: 'Invalid ID' }
 * #swagger.responses[404] = { description: 'Market not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/:id", asyncHandler(getMarketById));

/**
 * #swagger.tags = ['Markets']
 * #swagger.summary = 'Update market'
 * #swagger.description = 'Update a market (Admin only)'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Market ID', example: 1 }
 * #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/MarketUpdate' } }
 * #swagger.responses[200] = { description: 'Market updated successfully' }
 * #swagger.responses[400] = { description: 'Invalid input' }
 * #swagger.responses[404] = { description: 'Market not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.put("/:id", authenticate, requireAdmin, asyncHandler(updateMarket));

/**
 * #swagger.tags = ['Markets']
 * #swagger.summary = 'Delete market'
 * #swagger.description = 'Delete a market (Admin only)'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Market ID', example: 1 }
 * #swagger.responses[200] = { description: 'Market deleted successfully' }
 * #swagger.responses[404] = { description: 'Market not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.delete("/:id", authenticate, requireAdmin, asyncHandler(deleteMarket));

module.exports = router;
