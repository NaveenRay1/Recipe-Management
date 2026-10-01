const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Category = sequelize.define(
  "Category",
  {
    name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  { tableName: "categories", timestamps: false }
);

module.exports = Category;