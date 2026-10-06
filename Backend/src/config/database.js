const mongoose = require("mongoose");
const seedAccounts = require("./seedAccounts");

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri === "your_mongodb_connection_string") {
    console.error(
      "MongoDB connection failed: set MONGODB_URI in Backend/.env to a valid connection string."
    );
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB connected successfully");
    await seedAccounts();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

module.exports = connectDatabase;
