const { Router } = require("express");
const authenticate = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const {
  getBets,
  getBetById,
  getUserBets,
  getMarketBets,
  createBet,
} = require("../controllers/bets.controller");

const router = Router();

/**
 * #swagger.tags = ['Bets']
 * #swagger.summary = 'Get all bets'
 * #swagger.description = 'Retrieve paginated list of all bets'
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'Bets retrieved successfully' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/", asyncHandler(getBets));

/**
 * #swagger.tags = ['Bets']
 * #swagger.summary = 'Create new bet'
 * #swagger.description = 'Create a new bet on a market outcome'
 * #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/BetCreate' } }
 * #swagger.responses[201] = { description: 'Bet created successfully' }
 * #swagger.responses[400] = { description: 'Invalid input' }
 * #swagger.responses[404] = { description: 'Outcome not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.post("/", authenticate, asyncHandler(createBet));

/**
 * #swagger.tags = ['Bets']
 * #swagger.summary = 'Get bets for user'
 * #swagger.description = 'Retrieve paginated list of bets placed by a specific user'
 * #swagger.parameters['userId'] = { in: 'path', required: true, description: 'User ID', example: 1 }
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'User bets retrieved' }
 * #swagger.responses[404] = { description: 'User not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/user/:userId", asyncHandler(getUserBets));

/**
 * #swagger.tags = ['Bets']
 * #swagger.summary = 'Get bets for market'
 * #swagger.description = 'Retrieve paginated list of all bets placed on a specific market'
 * #swagger.parameters['marketId'] = { in: 'path', required: true, description: 'Market ID', example: 1 }
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'Market bets retrieved' }
 * #swagger.responses[404] = { description: 'Market not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/market/:marketId", asyncHandler(getMarketBets));

/**
 * #swagger.tags = ['Bets']
 * #swagger.summary = 'Get bet by ID'
 * #swagger.description = 'Retrieve a specific bet by ID'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Bet ID', example: 1 }
 * #swagger.responses[200] = { description: 'Bet found' }
 * #swagger.responses[400] = { description: 'Invalid ID' }
 * #swagger.responses[404] = { description: 'Bet not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/:id", asyncHandler(getBetById));

module.exports = router;
