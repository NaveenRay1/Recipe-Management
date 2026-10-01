const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Collection = sequelize.define(
  "Collection",
  {
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: "" },
  },
  { tableName: "collections" }
);

module.exports = Collection;