const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    serviceNumber: user.serviceNumber,
    role: user.role,
  };
}

async function login(req, res) {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const serviceNumber = String(req.body.serviceNumber || "").trim().toUpperCase();
    const password = String(req.body.password || "");

    if (!username || !serviceNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, service number, and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT login failed: JWT_SECRET is not set in Backend/.env.");
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const user = await User.findOne({ username });
    const serviceMatches = user && user.serviceNumber.toUpperCase() === serviceNumber;
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !serviceMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Incorrect username, service number, or password.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
}

function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
}

module.exports = {
  login,
  getProfile,
};
