const geminiService = require("../services/gemini.service");

// ---------------------------------------------------------------------------
// AI Controller — 3 Gemini-powered endpoints
//
// Feature 1: POST /api/ai/markets/generate
//   Admin-only. Generates N UTD-specific markets via Gemini and saves them.
//
// Feature 2: GET  /api/ai/markets/suggest
//   Any authenticated user. Returns AI market ideas WITHOUT saving, so admins
//   can preview and cherry-pick before committing to the database.
//
// Feature 3: POST /api/ai/markets/enrich
//   Any authenticated user. Given a market name (and optional draft
//   description), returns a polished UTD-contextual description from Gemini.
// ---------------------------------------------------------------------------

/**
 * Feature 1 — Generate & save AI markets (admin only)
 *
 * POST /api/ai/markets/generate
 * Body: { count?: number }   (1–10, default 3)
 *
 * Returns the newly created market rows.
 */
const generateMarkets = async (req, res) => {
  const rawCount = parseInt(req.body.count) || 3;
  const count = Math.min(Math.max(rawCount, 1), 10); // clamp 1–10

  try {
    const markets = await geminiService.generateAndSaveMarkets(
      req.user.id,
      count
    );
    res.status(201).json({
      message: `Generated and saved ${markets.length} AI market(s)`,
      markets,
    });
  } catch (err) {
    console.error("[AI] generateMarkets error:", err.message);
    if (err.message.includes("GEMINI_API_KEY")) {
      return res.status(503).json({ error: "AI service is not configured" });
    }
    res.status(500).json({ error: "Failed to generate markets" });
  }
};

/**
 * Feature 2 — Preview AI market suggestions without saving (admin only)
 *
 * GET /api/ai/markets/suggest?count=5
 *
 * Returns suggested market objects without persisting anything.
 * Useful for reviewing ideas before committing.
 */
const suggestMarkets = async (req, res) => {
  const rawCount = parseInt(req.query.count) || 3;
  const count = Math.min(Math.max(rawCount, 1), 10);

  try {
    const ideas = await geminiService.generateMarketIdeas(count);
    res.status(200).json({
      message: `AI suggested ${ideas.length} market idea(s) — not saved`,
      suggestions: ideas,
    });
  } catch (err) {
    console.error("[AI] suggestMarkets error:", err.message);
    if (err.message.includes("GEMINI_API_KEY")) {
      return res.status(503).json({ error: "AI service is not configured" });
    }
    res.status(500).json({ error: "Failed to fetch market suggestions" });
  }
};

/**
 * Feature 3 — Enrich a market description (any authenticated user)
 *
 * POST /api/ai/markets/enrich
 * Body: { name: string, description?: string }
 *
 * Returns an AI-polished description string with UTD context.
 */
const enrichDescription = async (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Market name is required" });
  }

  try {
    const enriched = await geminiService.enrichMarketDescription(
      name.trim(),
      description || ""
    );
    res.status(200).json({ enriched_description: enriched });
  } catch (err) {
    console.error("[AI] enrichDescription error:", err.message);
    if (err.message.includes("GEMINI_API_KEY")) {
      return res.status(503).json({ error: "AI service is not configured" });
    }
    res.status(500).json({ error: "Failed to enrich description" });
  }
};

module.exports = { generateMarkets, suggestMarkets, enrichDescription };