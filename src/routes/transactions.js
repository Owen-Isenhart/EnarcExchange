const { Router } = require("express");
const authenticate = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const {
  getTransactions,
  getTransactionById,
  getUserTransactions,
  createTransaction,
} = require("../controllers/transactions.controller");

const router = Router();

/**
 * #swagger.tags = ['Transactions']
 * #swagger.summary = 'Get all transactions'
 * #swagger.description = 'Retrieve paginated list of all transactions'
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'Transactions retrieved successfully' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/", asyncHandler(getTransactions));

/**
 * #swagger.tags = ['Transactions']
 * #swagger.summary = 'Create new transaction'
 * #swagger.description = 'Create a new transaction (transfer, deposit, etc.)'
 * #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/TransactionCreate' } }
 * #swagger.responses[201] = { description: 'Transaction created successfully' }
 * #swagger.responses[400] = { description: 'Invalid input' }
 * #swagger.responses[404] = { description: 'User not found' }
 * #swagger.responses[401] = { description: 'Unauthorized' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.post("/", authenticate, asyncHandler(createTransaction));

/**
 * #swagger.tags = ['Transactions']
 * #swagger.summary = 'Get transactions for user'
 * #swagger.description = 'Retrieve paginated list of transactions for a specific user'
 * #swagger.parameters['userId'] = { in: 'path', required: true, description: 'User ID', example: 1 }
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'User transactions retrieved' }
 * #swagger.responses[404] = { description: 'User not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/user/:userId", asyncHandler(getUserTransactions));

/**
 * #swagger.tags = ['Transactions']
 * #swagger.summary = 'Get transaction by ID'
 * #swagger.description = 'Retrieve a specific transaction by ID'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'Transaction ID', example: 1 }
 * #swagger.responses[200] = { description: 'Transaction found' }
 * #swagger.responses[400] = { description: 'Invalid ID' }
 * #swagger.responses[404] = { description: 'Transaction not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/:id", asyncHandler(getTransactionById));

module.exports = router;
