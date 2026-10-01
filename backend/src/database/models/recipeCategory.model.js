const { sequelize } = require("../../config/db");

// join table: foreign keys are added by the associations in index.js
const RecipeCategory = sequelize.define(
  "RecipeCategory",
  {},
  { tableName: "recipe_categories", timestamps: false }
);

module.exports = RecipeCategory;