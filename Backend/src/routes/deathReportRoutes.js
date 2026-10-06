const express = require("express");
const {
  approveDeathReport,
  createDeathReport,
  listIncomingDeathReports,
  listMyDeathReports,
  updateDeathReport,
} = require("../controllers/deathReportController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/incoming", requireAuth, listIncomingDeathReports);
router.get("/", requireAuth, listMyDeathReports);
router.post("/", requireAuth, createDeathReport);
router.patch("/:id", requireAuth, updateDeathReport);
router.post("/:id/approve", requireAuth, approveDeathReport);

module.exports = router;
