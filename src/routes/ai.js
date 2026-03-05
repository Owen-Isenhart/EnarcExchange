const { Router } = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateMarkets,
  suggestMarkets,
  enrichDescription,
} = require("../controllers/ai.controller");

const router = Router();

/**
 * #swagger.tags = ['AI']
 * #swagger.summary = 'Generate and save AI markets'
 * #swagger.description = 'Uses Gemini to generate UTD-specific prediction markets and persists them (Admin only)'
 * #swagger.parameters['body'] = { in: 'body', schema: { count: 3 } }
 * #swagger.responses[201] = { description: 'Markets generated and saved' }
 * #swagger.responses[503] = { description: 'AI service not configured' }
 */
router.post(
  "/markets/generate",
  authenticate,
  requireAdmin,
  asyncHandler(generateMarkets)
);

/**
 * #swagger.tags = ['AI']
 * #swagger.summary = 'Preview AI market suggestions'
 * #swagger.description = 'Returns Gemini-generated market ideas without saving them (Admin only)'
 * #swagger.parameters['count'] = { in: 'query', description: 'Number of suggestions (1-10)', example: 3 }
 * #swagger.responses[200] = { description: 'Suggestions returned' }
 * #swagger.responses[503] = { description: 'AI service not configured' }
 */
router.get(
  "/markets/suggest",
  authenticate,
  requireAdmin,
  asyncHandler(suggestMarkets)
);

/**
 * #swagger.tags = ['AI']
 * #swagger.summary = 'Enrich a market description'
 * #swagger.description = 'Uses Gemini to write or improve a market description with UTD context'
 * #swagger.parameters['body'] = { in: 'body', schema: { name: 'Will CS 3345 have a curve?', description: '' } }
 * #swagger.responses[200] = { description: 'Enriched description returned' }
 * #swagger.responses[400] = { description: 'Missing market name' }
 * #swagger.responses[503] = { description: 'AI service not configured' }
 */
router.post(
  "/markets/enrich",
  authenticate,
  asyncHandler(enrichDescription)
);

module.exports = router;