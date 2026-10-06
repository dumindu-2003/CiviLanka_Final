const express = require("express");
const {
  approveNicForm,
  authorizeNicForm,
  listNicForms,
  saveNicForm,
} = require("../controllers/nicFormController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, listNicForms);
router.post("/", requireAuth, saveNicForm);
router.post("/:id/authorize", requireAuth, authorizeNicForm);
router.post("/:id/approve", requireAuth, approveNicForm);

module.exports = router;
