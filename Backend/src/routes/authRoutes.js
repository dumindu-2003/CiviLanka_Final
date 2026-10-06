const express = require("express");
const { getProfile, login } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", requireAuth, getProfile);

module.exports = router;
