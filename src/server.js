const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");

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
const errorHandler = require("./middleware/errorHandler");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: "Too many login/signup attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
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
      bets: "/api/bets",
      users: "/api/users",
      transactions: "/api/transactions",
      outcomes: "/api/outcomes",
      prices: "/api/prices",
    },
  })
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/bets", betRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/outcomes", outcomesRoutes);
app.use("/api/prices", pricesRoutes);

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
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API docs available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("✗ Database connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;