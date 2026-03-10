const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const { Server } = require("socket.io");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const requiredEnvVars = [
  "JWT_SECRET",
  "PGDATABASE",
  "PGUSER",
  "PGPASSWORD",
  "PGHOST",
];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const swaggerOutputPath = path.join(__dirname, "./swagger-output.json");
const authRoutes = require("./routes/auth");
const marketRoutes = require("./routes/markets");
const betRoutes = require("./routes/bets");
const usersRoutes = require("./routes/users");
const transactionsRoutes = require("./routes/transactions");
const outcomesRoutes = require("./routes/outcomes");
const pricesRoutes = require("./routes/prices");
const aiRoutes = require("./routes/ai");
const errorHandler = require("./middleware/errorHandler");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 50,
  message: "Too many login/signup attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const betsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 30 : 100,
  message: "Too many bet requests, please wait before trying again",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET", // Don't rate limit GET requests
});

const marketsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 20 : 60,
  message: "Too many market requests, please wait before trying again",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET", // Don't rate limit GET requests
});

app.get("/", (_req, res) =>
  res.json({
    name: "Enarc Exchange",
    description: "Prediction market for UTD — bet with Temoc Tokens",
    links: {
      health: "/health",
      apiDocs: "/api-docs",
      auth: "/api/auth",
      markets: "/api/markets",
      "markets/:id/prices": "/api/markets/:id/prices (LMSR)",
      "markets/:id/quote": "/api/markets/:id/quote?outcome_id=&amount=",
      "markets/:id/resolve": "POST /api/markets/:id/resolve (admin, body: { winning_outcome_id })",
      "markets/:id/seed": "POST /api/markets/:id/seed (admin, body: { quantities })",
      "users/me/positions": "GET /api/users/me/positions (auth)",
      "bets/sell": "POST /api/bets/sell (auth, body: { outcome_id, shares })",
      bets: "/api/bets",
      users: "/api/users",
      transactions: "/api/transactions",
      outcomes: "/api/outcomes",
      prices: "/api/prices",
      ai: "/api/ai",
    },
  })
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/health/db", (_req, res) => {
  pool
    .query("SELECT NOW()")
    .then((r) => res.json({ status: "ok", db: "connected", now: r.rows[0].now }))
    .catch((err) => res.status(503).json({ status: "error", db: "disconnected", error: err.message }));
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/markets", marketsLimiter, marketRoutes);
app.use("/api/bets", betsLimiter, betRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/outcomes", outcomesRoutes);
app.use("/api/prices", pricesRoutes);
app.use("/api/ai", aiRoutes);

if (fs.existsSync(swaggerOutputPath)) {
  const swaggerDocument = require(swaggerOutputPath);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("swagger-output.json not found - API docs disabled");
}

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

pool
  .query("SELECT NOW()")
  .then(() => {
    console.log("✓ Database connection verified");
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: "*" } });
    app.set("io", io);

    io.on("connection", (socket) => {
      socket.on("market:subscribe", (marketId) => {
        socket.join(`market:${marketId}`);
      });
      socket.on("market:unsubscribe", (marketId) => {
        socket.leave(`market:${marketId}`);
      });
    });

    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API docs available at http://localhost:${PORT}/api-docs`);
      console.log(`✓ WebSocket (Socket.io) enabled`);
    });
  })
  .catch((err) => {
    console.error("✗ Database connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;