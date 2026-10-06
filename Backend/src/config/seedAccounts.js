const bcrypt = require("bcryptjs");
const User = require("../models/User");

const STARTER_ACCOUNTS = [
  {
    name: "Nimal Perera",
    email: "v.perera@civilanka.lk",
    username: "v.perera",
    serviceNumber: "VO-100101",
    password: "Officer@123",
    role: "village_officer",
  },
  {
    name: "Sanduni Silva",
    email: "d.silva@civilanka.lk",
    username: "d.silva",
    serviceNumber: "DR-100102",
    password: "District@123",
    role: "district_registrar",
  },
  {
    name: "Malith Fernando",
    email: "m.fernando@civilanka.lk",
    username: "m.fernando",
    serviceNumber: "MR-220145",
    password: "Registrar@123",
    role: "marriage_registrar",
  },
  {
    name: "Kasun Jayasuriya",
    email: "b.jayasuriya@civilanka.lk",
    username: "b.jayasuriya",
    serviceNumber: "BM-100103",
    password: "Manager@123",
    role: "bank_manager",
  },
  {
    name: "Amali Fernando",
    email: "a.fernando@civilanka.lk",
    username: "a.fernando",
    serviceNumber: "AD-100104",
    password: "Admin@1234",
    role: "admin",
  },
];

async function seedAccounts() {
  const removed = await User.deleteMany({ role: "user" });
  if (removed.deletedCount > 0) {
    console.log(`Removed ${removed.deletedCount} general user account(s).`);
  }

  for (const account of STARTER_ACCOUNTS) {
    const existing = await User.findOne({ username: account.username });
    const passwordHash = await bcrypt.hash(account.password, 10);

    if (!existing) {
      await User.create({
        ...account,
        password: passwordHash,
      });
      console.log(`Seeded login account: ${account.username}`);
      continue;
    }

    const passwordIsHashed = existing.password.startsWith("$2");
    if (!passwordIsHashed || existing.role !== account.role) {
      existing.password = passwordHash;
      existing.role = account.role;
      existing.serviceNumber = account.serviceNumber;
      existing.name = account.name;
      existing.email = account.email;
      await existing.save();
      console.log(`Updated login account: ${account.username}`);
    }
  }
}

module.exports = seedAccounts;
