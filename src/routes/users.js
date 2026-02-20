const { Router } = require("express");
const asyncHandler = require("../utils/asyncHandler");
const {
  getUsers,
  getUserById,
  getUserByUsername,
  getUserStats,
} = require("../controllers/users.controller");

const router = Router();

/**
 * #swagger.tags = ['Users']
 * #swagger.summary = 'Get all users'
 * #swagger.description = 'Retrieve paginated list of all users'
 * #swagger.parameters['page'] = { in: 'query', description: 'Page number', example: 1 }
 * #swagger.parameters['limit'] = { in: 'query', description: 'Records per page', example: 10 }
 * #swagger.responses[200] = { description: 'Users retrieved successfully' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/", asyncHandler(getUsers));

/**
 * #swagger.tags = ['Users']
 * #swagger.summary = 'Get user by username'
 * #swagger.description = 'Retrieve a user by their username'
 * #swagger.parameters['username'] = { in: 'path', required: true, description: 'Username', example: 'johndoe' }
 * #swagger.responses[200] = { description: 'User found' }
 * #swagger.responses[404] = { description: 'User not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/username/:username", asyncHandler(getUserByUsername));

/**
 * #swagger.tags = ['Users']
 * #swagger.summary = 'Get user statistics'
 * #swagger.description = 'Retrieve statistics for a specific user'
 * #swagger.parameters['userId'] = { in: 'path', required: true, description: 'User ID', example: 1 }
 * #swagger.responses[200] = { description: 'User stats retrieved' }
 * #swagger.responses[404] = { description: 'User not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/:userId/stats", asyncHandler(getUserStats));

/**
 * #swagger.tags = ['Users']
 * #swagger.summary = 'Get user by ID'
 * #swagger.description = 'Retrieve a user by their ID'
 * #swagger.parameters['id'] = { in: 'path', required: true, description: 'User ID', example: 1 }
 * #swagger.responses[200] = { description: 'User found' }
 * #swagger.responses[400] = { description: 'Invalid ID' }
 * #swagger.responses[404] = { description: 'User not found' }
 * #swagger.responses[500] = { description: 'Server error' }
 */
router.get("/:id", asyncHandler(getUserById));

module.exports = router;
