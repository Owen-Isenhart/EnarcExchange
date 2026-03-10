async function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check is_admin from JWT claims (set during login/signup)
    // Fallback to database check if not in JWT (for backward compatibility)
    if (req.user.is_admin) {
      return next();
    }

    // Fallback: query database if claim not in JWT
    const isAdmin = await usersService.isAdmin(req.user.id);

    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = requireAdmin;
