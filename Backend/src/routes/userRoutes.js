const express = require("express");
const { createUser, deleteUser, listUsers, updateUser } = require("../controllers/userController");
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get("/", listUsers);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
