const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Ingredient = sequelize.define(
  "Ingredient",
  {
    name: { type: DataTypes.STRING(150), allowNull: false },
    quantity: { type: DataTypes.STRING(100), defaultValue: "" },
  },
  { tableName: "ingredients", timestamps: false }
);

module.exports = Ingredient;