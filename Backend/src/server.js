const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  console.error("Server error:", error.message);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

connectDatabase();

// Listen on all network interfaces so a phone on the same Wi-Fi can reach the API.
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`CiviLanka API running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
