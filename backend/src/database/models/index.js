const { sequelize } = require("../../config/db");

const User = require("./user.model");
const Recipe = require("./recipe.model");
const Ingredient = require("./ingredient.model");
const Category = require("./category.model");
const RecipeCategory = require("./recipeCategory.model");
const Favorite = require("./favorite.model");
const Collection = require("./collection.model");
const CollectionRecipe = require("./collectionRecipe.model");
const Review = require("./review.model");
const Follow = require("./follow.model");

// User <-> Recipe
User.hasMany(Recipe, { foreignKey: "userId", as: "recipes", onDelete: "CASCADE" });
Recipe.belongsTo(User, { foreignKey: "userId", as: "author" });

// Recipe <-> Ingredient
Recipe.hasMany(Ingredient, { foreignKey: "recipeId", as: "ingredients", onDelete: "CASCADE" });
Ingredient.belongsTo(Recipe, { foreignKey: "recipeId" });

// Recipe <-> Category
Recipe.belongsToMany(Category, {
  through: RecipeCategory,
  foreignKey: "recipeId",
  otherKey: "categoryId",
  as: "categories",
});
Category.belongsToMany(Recipe, {
  through: RecipeCategory,
  foreignKey: "categoryId",
  otherKey: "recipeId",
  as: "recipes",
});

// Favorites
User.hasMany(Favorite, { foreignKey: "userId", onDelete: "CASCADE" });
Favorite.belongsTo(User, { foreignKey: "userId" });
Recipe.hasMany(Favorite, { foreignKey: "recipeId", onDelete: "CASCADE" });
Favorite.belongsTo(Recipe, { foreignKey: "recipeId", as: "recipe" });

// Collections
User.hasMany(Collection, { foreignKey: "userId", as: "collections", onDelete: "CASCADE" });
Collection.belongsTo(User, { foreignKey: "userId" });
Collection.belongsToMany(Recipe, {
  through: CollectionRecipe,
  foreignKey: "collectionId",
  otherKey: "recipeId",
  as: "recipes",
});
Recipe.belongsToMany(Collection, {
  through: CollectionRecipe,
  foreignKey: "recipeId",
  otherKey: "collectionId",
  as: "collections",
});

// Reviews
User.hasMany(Review, { foreignKey: "userId", as: "reviews", onDelete: "CASCADE" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });
Recipe.hasMany(Review, { foreignKey: "recipeId", as: "reviews", onDelete: "CASCADE" });
Review.belongsTo(Recipe, { foreignKey: "recipeId", as: "recipe" });

// Follows (self-referencing through the Follow model)
Follow.belongsTo(User, { foreignKey: "followerId", as: "follower", onDelete: "CASCADE" });
Follow.belongsTo(User, { foreignKey: "followingId", as: "following", onDelete: "CASCADE" });

module.exports = {
  sequelize,
  User,
  Recipe,
  Ingredient,
  Category,
  RecipeCategory,
  Favorite,
  Collection,
  CollectionRecipe,
  Review,
  Follow,
};