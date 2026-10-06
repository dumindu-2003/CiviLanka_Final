const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Login token is missing.",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("Auth check failed: JWT_SECRET is not set in Backend/.env.");
    return res.status(500).json({
      success: false,
      message: "Server authentication is not configured.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Login token is not valid.",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Login token is not valid.",
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only an admin can add users.",
    });
  }

  return next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
