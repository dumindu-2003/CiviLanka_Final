const express = require("express");
const { createUser, listUsers } = require("../controllers/userController");
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get("/", listUsers);
router.post("/", createUser);

module.exports = router;
