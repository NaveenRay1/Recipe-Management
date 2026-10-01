const { Favorite, Recipe, User } = require("../../database/models");
const ApiError = require("../../utils/ApiError");
const { getPagination, buildMeta } = require("../../utils/pagination");

const addFavorite = async (userId, recipeId) => {
  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) throw new ApiError(404, "Recipe not found");
  await Favorite.findOrCreate({ where: { userId, recipeId: recipe.id } });
};

const removeFavorite = async (userId, recipeId) => {
  await Favorite.destroy({ where: { userId, recipeId } });
};

const listFavorites = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);

  const { rows, count } = await Favorite.findAndCountAll({
    where: { userId },
    include: [
      {
        model: Recipe,
        as: "recipe",
        attributes: { exclude: ["instructions", "imagePublicId"] },
        include: [{ model: User, as: "author", attributes: ["id", "name", "avatar"] }],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    recipes: rows.map((f) => f.recipe),
    pagination: buildMeta(count, page, limit),
  };
};

module.exports = { addFavorite, removeFavorite, listFavorites };