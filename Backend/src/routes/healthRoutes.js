const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CiviLanka API is running",
  });
});

router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Invalid health route request",
  });
});

module.exports = router;
