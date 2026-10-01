require("dotenv").config();
const bcrypt = require("bcryptjs");

const app = require("./app");
const { connectDB } = require("./config/db");
const { sequelize, User } = require("./database/models");

// creates the first admin from .env if it doesn't exist yet
const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  const exists = await User.findOne({ where: { email: ADMIN_EMAIL.toLowerCase() } });
  if (exists) return;

  await User.create({
    name: ADMIN_NAME || "Admin",
    email: ADMIN_EMAIL.toLowerCase(),
    password: await bcrypt.hash(ADMIN_PASSWORD, 10),
    role: "admin",
  });
  console.log("Admin user created");
};

const start = async () => {
  try {
    await connectDB();
    await sequelize.sync(); // creates missing tables; use { force: true } once to reset in dev
    await seedAdmin();

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();