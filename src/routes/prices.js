const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const asyncHandler = require("../utils/asyncHandler");
const {
  getPrices,
  getPriceById,
  getOutcomePriceHistory,
  getLatestPrices,
  createPrice,
  updatePrice,
  deletePrice,
} = require("../controllers/price.controller");

const router = Router();

/**
 * #swagger.tags = ['Prices']
 * #swagger.summary = 'Get all price records'
 * #swagger.description = 'Retrieve paginated price history records'
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'Price records retrieved successfully' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/", asyncHandler(getPrices));

/**
 * #swagger.tags = ['Prices']
 * #swagger.summary = 'Get latest prices'
 * #swagger.description = 'Get the latest price for each outcome'
 * #swagger.responses[200] = { description: 'Latest prices retrieved' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/latest", asyncHandler(getLatestPrices));

/**
 * #swagger.tags = ['Prices']
 * #swagger.summary = 'Create new price record'
 * #swagger.description = 'Create a new price history entry (Admin only)'
 * #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/PriceCreate' } }
 * #swagger.responses[201] = { description: 'Price created successfully' }
 * #swagger.responses[400] = { description: 'Invalid input' }
 * #swagger.responses[404] = { description: 'Outcome not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 */
router.post("/", authenticate, requireAdmin, asyncHandler(createPrice));

/**
 * #swagger.tags = ['Prices']
 * #swagger.summary = 'Get price history for outcome'
 * #swagger.description = 'Retrieve paginated price history for a specific outcome'
 * #swagger.parameters['outcomeId'] = { in: 'path', required: true, description: 'Outcome ID', example: 1 }
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'Price history retrieved' }
 * #swagger.responses[404] = { description: 'Outcome not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/outcome/:outcomeId", asyncHandler(getOutcomePriceHistory));

/**
 * #swagger.tags = ['Prices']
 * #swagger.summary = 'Get price by ID'
 * #swagger.description = 'Retrieve a specific price record by ID'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Price ID', example: 1 }
 * #swagger.responses[200] = { description: 'Price found' }
 * #swagger.responses[400] = { description: 'Invalid ID' }
 * #swagger.responses[404] = { description: 'Price not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/:id", asyncHandler(getPriceById));

/**
 * #swagger.tags = ['Prices']
 * #swagger.summary = 'Update price'
 * #swagger.description = 'Update a price record (Admin only)'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Price ID', example: 1 }
 * #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/PriceUpdate' } }
 * #swagger.responses[200] = { description: 'Price updated successfully' }
 * #swagger.responses[400] = { description: 'Invalid input' }
 * #swagger.responses[404] = { description: 'Price not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 */
router.put("/:id", authenticate, requireAdmin, asyncHandler(updatePrice));

/**
 * #swagger.tags = ['Prices']
 * #swagger.summary = 'Delete price'
 * #swagger.description = 'Delete a price record (Admin only)'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Price ID', example: 1 }
 * #swagger.responses[200] = { description: 'Price deleted successfully' }
 * #swagger.responses[404] = { description: 'Price not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 */
router.delete("/:id", authenticate, requireAdmin, asyncHandler(deletePrice));

module.exports = router;
