const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Recipe = sequelize.define(
  "Recipe",
  {
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: "" },
    instructions: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, defaultValue: null },
    imagePublicId: { type: DataTypes.STRING, defaultValue: null },
    prepTime: { type: DataTypes.INTEGER, defaultValue: 0 }, // minutes
    cookTime: { type: DataTypes.INTEGER, defaultValue: 0 }, // minutes
    servings: { type: DataTypes.INTEGER, defaultValue: 1 },
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"),
      defaultValue: "easy",
    },
    isVegetarian: { type: DataTypes.BOOLEAN, defaultValue: false },
    isVegan: { type: DataTypes.BOOLEAN, defaultValue: false },
    isGlutenFree: { type: DataTypes.BOOLEAN, defaultValue: false },
    avgRating: { type: DataTypes.FLOAT, defaultValue: 0 },
    ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: "recipes" }
);

module.exports = Recipe;