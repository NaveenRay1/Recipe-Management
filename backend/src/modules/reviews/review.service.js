const { fn, col } = require("sequelize");
const { Review, Recipe, User } = require("../../database/models");
const ApiError = require("../../utils/ApiError");
const { getPagination, buildMeta } = require("../../utils/pagination");

const userInclude = { model: User, as: "user", attributes: ["id", "name", "avatar"] };

// keep avgRating / ratingCount on the recipe in sync
const refreshRecipeRating = async (recipeId) => {
  const stats = await Review.findOne({
    where: { recipeId },
    attributes: [
      [fn("AVG", col("rating")), "avg"],
      [fn("COUNT", col("id")), "count"],
    ],
    raw: true,
  });
  await Recipe.update(
    {
      avgRating: Number(Number(stats.avg || 0).toFixed(1)),
      ratingCount: Number(stats.count || 0),
    },
    { where: { id: recipeId } }
  );
};

const createReview = async (userId, recipeId, { rating, comment }) => {
  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) throw new ApiError(404, "Recipe not found");
  if (recipe.userId === userId) throw new ApiError(400, "You cannot review your own recipe");

  const existing = await Review.findOne({ where: { userId, recipeId: recipe.id } });
  if (existing) throw new ApiError(409, "You have already reviewed this recipe");

  const review = await Review.create({ userId, recipeId: recipe.id, rating, comment });
  await refreshRecipeRating(recipe.id);
  return Review.findByPk(review.id, { include: [userInclude] });
};

const listReviews = async (recipeId, query) => {
  const { page, limit, offset } = getPagination(query, 10);
  const { rows, count } = await Review.findAndCountAll({
    where: { recipeId },
    include: [userInclude],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
  return { reviews: rows, pagination: buildMeta(count, page, limit) };
};

const findAllowed = async (id, user) => {
  const review = await Review.findByPk(id);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.userId !== user.id && user.role !== "admin") {
    throw new ApiError(403, "You can only modify your own reviews");
  }
  return review;
};

const updateReview = async (id, user, body) => {
  const review = await findAllowed(id, user);
  await review.update(body);
  await refreshRecipeRating(review.recipeId);
  return Review.findByPk(review.id, { include: [userInclude] });
};

const deleteReview = async (id, user) => {
  const review = await findAllowed(id, user);
  const { recipeId } = review;
  await review.destroy();
  await refreshRecipeRating(recipeId);
};

module.exports = { createReview, listReviews, updateReview, deleteReview };