const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;