const express = require("express");
const {
  createMarriageRegistration,
  listIncomingMarriageRegistrations,
  listMyMarriageRegistrations,
} = require("../controllers/marriageRegistrationController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/incoming", requireAuth, listIncomingMarriageRegistrations);
router.get("/", requireAuth, listMyMarriageRegistrations);
router.post("/", requireAuth, createMarriageRegistration);

module.exports = router;
