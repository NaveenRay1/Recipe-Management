const { sequelize } = require("../../config/db");

const CollectionRecipe = sequelize.define(
  "CollectionRecipe",
  {},
  { tableName: "collection_recipes", updatedAt: false }
);

module.exports = CollectionRecipe;