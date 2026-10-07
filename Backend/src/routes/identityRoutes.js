const express = require("express");
const { listCertificates, lookupIdentity } = require("../controllers/identityController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/certificates", requireAuth, listCertificates);
router.get("/verify", requireAuth, lookupIdentity);

module.exports = router;
