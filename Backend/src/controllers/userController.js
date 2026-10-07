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

function userFieldErrors(body, { passwordRequired }) {
  const errors = {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const username = String(body.username || "").trim().toLowerCase();
  const serviceNumber = String(body.serviceNumber || "").trim().toUpperCase();
  const password = String(body.password || "");
  const role = String(body.role || "").trim();

  if (!/^[A-Za-z][A-Za-z .'-]{1,}$/.test(name)) {
    errors.name = "Enter a valid full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!/^[a-z]+(\.[a-z]+)+$/.test(username)) {
    errors.username = "Username must look like j.perera.";
  }
  if (!/^[A-Z]{2,}-\d{3,}$/.test(serviceNumber)) {
    errors.serviceNumber = "Service number must look like VO-100101.";
  }
  if (passwordRequired && password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  } else if (!passwordRequired && password && password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  if (!STAFF_ROLES.includes(role)) {
    errors.role = "Choose a staff role.";
  }

  return errors;
}

function readAccount(body) {
  return {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    username: String(body.username || "").trim().toLowerCase(),
    serviceNumber: String(body.serviceNumber || "").trim().toUpperCase(),
    password: String(body.password || ""),
    role: String(body.role || "").trim(),
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
    const account = readAccount(req.body);
    const errors = userFieldErrors(account, { passwordRequired: true });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Check the highlighted fields.",
        errors,
      });
    }

    const duplicate = await User.findOne({
      $or: [
        { username: account.username },
        { email: account.email },
        { serviceNumber: account.serviceNumber },
      ],
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "That username, email, or service number is already used.",
        errors: duplicateFields(duplicate, account),
      });
    }

    const user = await User.create({
      name: account.name,
      email: account.email,
      username: account.username,
      serviceNumber: account.serviceNumber,
      password: await bcrypt.hash(account.password, 10),
      role: account.role,
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

async function updateUser(req, res) {
  try {
    const account = readAccount(req.body);
    const errors = userFieldErrors(account, { passwordRequired: false });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Check the highlighted fields.",
        errors,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "This user could not be found.",
      });
    }

    if (user.role === "admin" && account.role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "The last admin account cannot be changed to another role.",
          errors: { role: "Keep at least one admin account." },
        });
      }
    }

    const duplicate = await User.findOne({
      _id: { $ne: user._id },
      $or: [
        { username: account.username },
        { email: account.email },
        { serviceNumber: account.serviceNumber },
      ],
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "That username, email, or service number is already used.",
        errors: duplicateFields(duplicate, account),
      });
    }

    user.name = account.name;
    user.email = account.email;
    user.username = account.username;
    user.serviceNumber = account.serviceNumber;
    user.role = account.role;
    if (account.password) {
      user.password = await bcrypt.hash(account.password, 10);
    }
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Could not update user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not update the user.",
    });
  }
}

async function deleteUser(req, res) {
  try {
    if (req.user._id.toString() === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete the account you are signed in with.",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "This user could not be found.",
      });
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "The last admin account cannot be deleted.",
        });
      }
    }

    await user.deleteOne();
    return res.status(200).json({
      success: true,
      message: "User deleted.",
    });
  } catch (error) {
    console.error("Could not delete user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not delete the user.",
    });
  }
}

function duplicateFields(existing, account) {
  const errors = {};
  if (existing.username === account.username) {
    errors.username = "This username is already used.";
  }
  if (existing.email === account.email) {
    errors.email = "This email is already used.";
  }
  if (existing.serviceNumber === account.serviceNumber) {
    errors.serviceNumber = "This service number is already used.";
  }
  return errors;
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
