const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const swaggerOutputPath = path.join(__dirname, './swagger-output.json');
const authRoutes = require("./routes/auth");
const marketRoutes = require("./routes/markets");
const betRoutes = require("./routes/bets");
const usersRoutes = require("./routes/users");
const transactionsRoutes = require("./routes/transactions");
const outcomesRoutes = require("./routes/outcomes");
const pricesRoutes = require("./routes/prices");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// routes
app.use("/api/auth", authRoutes); 
app.use("/markets", marketRoutes);
app.use("/bets", betRoutes);
app.use("/users", usersRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/outcomes", outcomesRoutes);
app.use("/prices", pricesRoutes);

if (fs.existsSync(swaggerOutputPath)) {
    const swaggerDocument = require(swaggerOutputPath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
    console.log('swagger-output.json not found. ');
}
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;