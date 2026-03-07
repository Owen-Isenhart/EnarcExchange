const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Ensure consistent error response shape
  const errorMessage =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Unknown error";

  res.status(500).json({
    error: errorMessage,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
