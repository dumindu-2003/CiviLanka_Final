const bcrypt = require("bcryptjs");
const User = require("../models/User");

const STAFF_ROLES = [
  "village_officer",
  "district_registrar",
  "marriage_registrar",
  "bank_manager",
  "admin",
];

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

async function listUsers(req, res) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      users: users.map(publicUser),
    });
  } catch (error) {
    console.error("Could not list users:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load users.",
    });
  }
}

async function createUser(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const username = String(req.body.username || "").trim().toLowerCase();
    const serviceNumber = String(req.body.serviceNumber || "").trim().toUpperCase();
    const password = String(req.body.password || "");
    const role = String(req.body.role || "").trim();

    if (!name || !email || !username || !serviceNumber || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, username, service number, password, and role are required.",
      });
    }

    if (!/^[a-z]+(\.[a-z]+)+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username must look like j.perera.",
      });
    }

    if (!/^[A-Z]{2,}-\d{3,}$/.test(serviceNumber)) {
      return res.status(400).json({
        success: false,
        message: "Service number must look like VO-100101.",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Choose a staff role. A general user account cannot be created.",
      });
    }

    const duplicate = await User.findOne({
      $or: [{ username }, { email }, { serviceNumber }],
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "That username, email, or service number is already used.",
      });
    }

    const user = await User.create({
      name,
      email,
      username,
      serviceNumber,
      password: await bcrypt.hash(password, 10),
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User added.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Could not create user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not add the user.",
    });
  }
}

module.exports = {
  listUsers,
  createUser,
};
