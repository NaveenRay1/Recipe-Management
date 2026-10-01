const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Review = sequelize.define(
  "Review",
  {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT, defaultValue: "" },
  },
  {
    tableName: "reviews",
    indexes: [{ unique: true, fields: ["userId", "recipeId"] }],
  }
);

module.exports = Review;