const dns = require("dns");
const mongoose = require("mongoose");
const seedAccounts = require("./seedAccounts");

function useWorkingDns() {
  const servers = dns.getServers();
  const onlyLocalhost = servers.every(
    (server) => server === "127.0.0.1" || server === "::1"
  );

  if (onlyLocalhost) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  useWorkingDns();

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
