
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db");

// ---------------------------------------------------------------------------
// UTD context fed to Gemini on every request so it has full situational
// awareness and can produce relevant, campus-specific market ideas.
// ---------------------------------------------------------------------------
const UTD_CONTEXT = `
You are a market-idea generator for Enarc Exchange, a prediction market platform
exclusively for University of Texas at Dallas (UTD) students who bet virtual
"Temoc Tokens" — not real money.

## About UTD
- Located in Richardson, Texas (DFW area), ~34,000 students (2024)
- Mascot: Temoc the Comet
- Seven schools: Erik Jonsson School of Engineering & Computer Science,
  Naveen Jindal School of Management, School of Natural Sciences & Mathematics,
  School of Arts, Technology & Emerging Communication, School of Behavioral &
  Brain Sciences, School of Economic, Political & Policy Sciences,
  School of Interdisciplinary Studies
- Top programs: Computer Science, Software Engineering, Electrical Engineering,
  Finance, Accounting, MIS, Neuroscience, Marketing, Data Science, Psychology
- Sports: NCAA Division III — Men's/Women's Basketball, Soccer, Cross-Country,
  Tennis, Golf, Volleyball, Track & Field. The teams are called "The Comets."
- Campus spots: Student Union (SU), Founders Building, Activity Center (AC),
  Dining Hall West (DHW), Canyon Café, Comet Café, Starbucks, Einstein Bros,
  Green Center, The Plinth, Residence halls (Northside, Waterview Park, etc.)
- Major recurring events: Fall/Spring Commencement, Homecoming, Icebreaker
  (fall orientation), Eclipse (spring festival), ComETx (TEDx-style talks),
  Founders Day, UTD Open House, HackUTD (annual hackathon), Career Fair,
  Research Week, Greek life events (UTD has IFC, NPHC, Panhellenic)
- Academic calendar anchors: Fall semester Aug–Dec, Spring Jan–May,
  Summer May–Aug; Add/Drop deadline, Withdrawal deadline, Finals weeks,
  Registration windows (often a hot topic)
- Student Government: SG elections happen every spring
- Local DFW context: Texas winter storms, Dallas Cowboys/Mavericks/Stars/Rangers
  outcomes that UTD students follow, DART rail access to UTD (Orange Line)

## Market Rules on Enarc Exchange
- Markets have a name (question), a description, and 2–4 possible outcomes.
- Markets resolve on a specific date (end_time).
- Good markets are objectively resolvable — there is a clear, verifiable answer.
- Avoid markets that could be offensive, involve real money, or are purely
  subjective/opinion polls.
- Markets should be timely and relevant to the current or upcoming semester.
`;

// ---------------------------------------------------------------------------
// Schema shape Gemini must return for market generation
// ---------------------------------------------------------------------------
const MARKET_GENERATION_SCHEMA = {
  type: "object",
  properties: {
    markets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          outcomes: {
            type: "array",
            items: { type: "string" },
          },
          duration_days: { type: "number" },
        },
        required: ["name", "description", "outcomes", "duration_days"],
      },
    },
  },
  required: ["markets"],
};

// ---------------------------------------------------------------------------
// Lazy-initialised Gemini client (only created if key is present)
// ---------------------------------------------------------------------------
let _genAI = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

function getModel(schema) {
  const genAI = getClient();
  const config = {
    responseMimeType: "application/json",
  };
  if (schema) config.responseSchema = schema;
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    generationConfig: config,
  });
}

// ---------------------------------------------------------------------------
// Feature 1: Generate market ideas (with optional context on existing markets
// so Gemini avoids duplicates)
// ---------------------------------------------------------------------------
const geminiService = {
  /**
   * Ask Gemini to suggest `count` UTD-specific prediction markets.
   * Returns an array of raw market objects (not yet saved to the DB).
   *
   * @param {number} count - How many markets to generate (1–10)
   * @param {string[]} existingMarketNames - Names of open markets to avoid duplicates
   * @returns {Promise<Array>}
   */
  async generateMarketIdeas(count = 3, existingMarketNames = []) {
    const model = getModel(MARKET_GENERATION_SCHEMA);

    const avoidClause =
      existingMarketNames.length > 0
        ? `\n\nAlready-open markets to AVOID duplicating:\n${existingMarketNames.map((n) => `- ${n}`).join("\n")}`
        : "";

    const prompt = `${UTD_CONTEXT}${avoidClause}

---

Generate exactly ${count} unique, creative, and resolvable prediction market idea(s)
for UTD students. Each market must:
- Have a clear yes/no or multiple-choice question as the name
- Have a 1–3 sentence description giving context
- Have 2–4 distinct, mutually exclusive outcome strings
- Have a duration_days (integer) indicating how many days from today until resolution

Return ONLY the JSON object matching the required schema.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return parsed.markets || [];
  },

  // ---------------------------------------------------------------------------
  // Feature 2: Enrich / polish a market description using UTD context
  // ---------------------------------------------------------------------------
  /**
   * Given a market name and optional draft description, Gemini returns a
   * polished, UTD-contextual description (≤ 300 chars).
   *
   * @param {string} name - Market question/name
   * @param {string} [draftDescription] - Optional existing description draft
   * @returns {Promise<string>} enriched description
   */
  async enrichMarketDescription(name, draftDescription = "") {
    const schema = {
      type: "object",
      properties: {
        description: { type: "string" },
      },
      required: ["description"],
    };

    const model = getModel(schema);

    const draftPart = draftDescription
      ? `\nDraft description to improve: "${draftDescription}"`
      : "";

    const prompt = `${UTD_CONTEXT}

---

A UTD student is creating this prediction market:
Market name: "${name}"${draftPart}

Write a concise, engaging description (max 300 characters) that:
- Gives relevant UTD context
- Explains how/when the market will resolve
- Is factual, not hype-y

Return ONLY the JSON object with a single "description" field.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return parsed.description || "";
  },

  // ---------------------------------------------------------------------------
  // Feature 3 (internal helper used by auto-trigger and generate endpoint):
  // Count open markets & save AI-generated markets to the database
  // ---------------------------------------------------------------------------
  /**
   * Returns the count of currently open markets.
   * @returns {Promise<number>}
   */
  async countOpenMarkets() {
    const result = await pool.query(
      "SELECT COUNT(*) FROM markets WHERE status = 'open'"
    );
    return parseInt(result.rows[0].count, 10);
  },

  /**
   * Saves an array of AI-generated market objects to the database.
   * Each market also has its outcomes inserted.
   *
   * @param {number} adminUserId - The user ID used as created_by
   * @param {Array} markets - Markets from generateMarketIdeas()
   * @returns {Promise<Array>} saved market rows
   */
  async saveGeneratedMarkets(adminUserId, markets) {
    const saved = [];
    for (const m of markets) {
      const durationDays = Math.max(1, Math.round(m.duration_days || 30));
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + durationDays);

      // Trim to schema limits
      const name = (m.name || "").slice(0, 200);
      const description = (m.description || "").slice(0, 1000);

      const marketResult = await pool.query(
        `INSERT INTO markets (name, description, created_by, start_time, end_time, liquidity_parameter, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'open')
         RETURNING *`,
        [name, description, adminUserId, startTime, endTime, 100.0]
      );
      const market = marketResult.rows[0];

      // Insert outcomes
      const outcomes = Array.isArray(m.outcomes) ? m.outcomes.slice(0, 4) : [];
      for (const outcomeDesc of outcomes) {
        await pool.query(
          "INSERT INTO market_outcomes (market_id, description) VALUES ($1, $2)",
          [market.id, outcomeDesc.slice(0, 500)]
        );
      }

      saved.push(market);
    }
    return saved;
  },

  /**
   * One-shot helper: generate `count` markets and save them.
   * Used by the auto-trigger on market delete.
   *
   * @param {number} adminUserId
   * @param {number} count
   * @returns {Promise<Array>}
   */
  async generateAndSaveMarkets(adminUserId, count = 3) {
    // Fetch existing open market names to avoid duplication
    const existing = await pool.query(
      "SELECT name FROM markets WHERE status = 'open' LIMIT 50"
    );
    const existingNames = existing.rows.map((r) => r.name);

    const ideas = await this.generateMarketIdeas(count, existingNames);
    return this.saveGeneratedMarkets(adminUserId, ideas);
  },
};

module.exports = geminiService;
