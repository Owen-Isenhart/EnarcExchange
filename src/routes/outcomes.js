const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const asyncHandler = require("../utils/asyncHandler");
const {
  getOutcomes,
  getOutcomeById,
  getMarketOutcomes,
  createOutcome,
  updateOutcome,
  deleteOutcome,
} = require("../controllers/outcomes.controller");

const router = Router();

/**
 * #swagger.tags = ['Outcomes']
 * #swagger.summary = 'Get all outcomes'
 * #swagger.description = 'Retrieve paginated list of all market outcomes'
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'Outcomes retrieved successfully' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/", asyncHandler(getOutcomes));

/**
 * #swagger.tags = ['Outcomes']
 * #swagger.summary = 'Create new outcome'
 * #swagger.description = 'Create a new market outcome (Admin only)'
 * #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/OutcomeCreate' } }
 * #swagger.responses[201] = { description: 'Outcome created successfully' }
 * #swagger.responses[400] = { description: 'Invalid input' }
 * #swagger.responses[404] = { description: 'Market not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.post("/", authenticate, requireAdmin, asyncHandler(createOutcome));

/**
 * #swagger.tags = ['Outcomes']
 * #swagger.summary = 'Get outcomes for market'
 * #swagger.description = 'Retrieve paginated list of outcomes for a specific market'
 * #swagger.parameters['marketId'] = { in: 'path', required: true, description: 'Market ID', example: 1 }
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'Outcomes retrieved' }
 * #swagger.responses[404] = { description: 'Market not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/market/:marketId", asyncHandler(getMarketOutcomes));

/**
 * #swagger.tags = ['Outcomes']
 * #swagger.summary = 'Get outcome by ID'
 * #swagger.description = 'Retrieve a specific outcome by ID'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Outcome ID', example: 1 }
 * #swagger.responses[200] = { description: 'Outcome found' }
 * #swagger.responses[400] = { description: 'Invalid ID' }
 * #swagger.responses[404] = { description: 'Outcome not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/:id", asyncHandler(getOutcomeById));

/**
 * #swagger.tags = ['Outcomes']
 * #swagger.summary = 'Update outcome'
 * #swagger.description = 'Update an outcome (Admin only)'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Outcome ID', example: 1 }
 * #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/OutcomeUpdate' } }
 * #swagger.responses[200] = { description: 'Outcome updated successfully' }
 * #swagger.responses[400] = { description: 'Invalid input' }
 * #swagger.responses[404] = { description: 'Outcome not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.put("/:id", authenticate, requireAdmin, asyncHandler(updateOutcome));

/**
 * #swagger.tags = ['Outcomes']
 * #swagger.summary = 'Delete outcome'
 * #swagger.description = 'Delete an outcome (Admin only)'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Outcome ID', example: 1 }
 * #swagger.responses[200] = { description: 'Outcome deleted successfully' }
 * #swagger.responses[404] = { description: 'Outcome not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.delete("/:id", authenticate, requireAdmin, asyncHandler(deleteOutcome));

module.exports = router;
