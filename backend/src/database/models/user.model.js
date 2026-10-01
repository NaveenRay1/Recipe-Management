const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const User = sequelize.define(
  "User",
  {
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT, defaultValue: "" },
    avatar: { type: DataTypes.STRING, defaultValue: null },
    role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
    status: {
      type: DataTypes.ENUM("active", "pending", "banned"),
      defaultValue: "active",
    },
  },
  { tableName: "users" }
);

// never leak the password hash in API responses
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;