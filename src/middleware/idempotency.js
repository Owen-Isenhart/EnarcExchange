/**
 * Idempotency middleware for POST requests that mutate state.
 * Prevents duplicate bets/sells when requests are retried.
 */

const pool = require("../config/db");

/**
 * Middleware that checks for duplicate requests using idempotency keys.
 * Requests must include X-Idempotency-Key header.
 * Apply to POST routes that should be idempotent (bets, sells, etc).
 */
const idempotencyMiddleware = async (req, res, next) => {
  // Only apply to POST/PUT/PATCH requests
  if (!["POST", "PUT", "PATCH"].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers["x-idempotency-key"];

  // If no key provided, client accepts risk of duplicates
  if (!idempotencyKey) {
    return next();
  }

  // Must be authenticated to use idempotency
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Authenticated requests only for idempotency" });
  }

  try {
    // Check if this request has been processed before
    const existingResult = await pool.query(
      `SELECT response_status, response_body FROM idempotency_keys
       WHERE user_id = $1 AND idempotency_key = $2 AND request_path = $3
       AND created_at > NOW() - INTERVAL '24 hours'`,
      [req.user.id, idempotencyKey, req.path]
    );

    if (existingResult.rows.length > 0) {
      // Return cached response
      const cachedResponse = existingResult.rows[0];
      return res
        .status(cachedResponse.response_status)
        .json(cachedResponse.response_body);
    }

    // Store the original send function
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.json to capture the response
    res.json = function (data) {
      // Store in idempotency table
      pool.query(
        `INSERT INTO idempotency_keys (user_id, idempotency_key, request_path, response_status, response_body)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, idempotency_key, request_path) DO UPDATE
         SET response_status = $4, response_body = $5, created_at = NOW()`,
        [req.user.id, idempotencyKey, req.path, res.statusCode, data]
      ).catch((err) => {
        console.error("Error storing idempotency key:", err.message);
      });

      // Call original json
      originalJson.call(this, data);
    };

    next();
  } catch (err) {
    console.error("Idempotency middleware error:", err);
    // Continue without idempotency on error
    next();
  }
};

module.exports = idempotencyMiddleware;
