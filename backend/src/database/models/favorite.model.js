const { sequelize } = require("../../config/db");

const Favorite = sequelize.define(
  "Favorite",
  {},
  {
    tableName: "favorites",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["userId", "recipeId"] }],
  }
);

module.exports = Favorite;