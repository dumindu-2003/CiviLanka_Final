const express = require("express");
const {
  createBirthApplication,
  listBirthApplications,
  updateBirthApplicationStatus,
} = require("../controllers/birthApplicationController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, listBirthApplications);
router.post("/", requireAuth, createBirthApplication);
router.patch("/:id/status", requireAuth, updateBirthApplicationStatus);

module.exports = router;
