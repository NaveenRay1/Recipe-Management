const { Op } = require("sequelize");
const { Follow, User, Recipe, Review } = require("../../database/models");
const ApiError = require("../../utils/ApiError");
const { getPagination, buildMeta } = require("../../utils/pagination");

const userAttrs = ["id", "name", "avatar", "bio"];

const follow = async (followerId, targetId) => {
  if (Number(targetId) === followerId) throw new ApiError(400, "You cannot follow yourself");
  const target = await User.findByPk(targetId);
  if (!target || target.status !== "active") throw new ApiError(404, "User not found");
  await Follow.findOrCreate({ where: { followerId, followingId: target.id } });
};

const unfollow = async (followerId, targetId) => {
  await Follow.destroy({ where: { followerId, followingId: targetId } });
};

const getFollowers = async (userId, query) => {
  const { page, limit, offset } = getPagination(query, 20);
  const { rows, count } = await Follow.findAndCountAll({
    where: { followingId: userId },
    include: [{ model: User, as: "follower", attributes: userAttrs }],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
  return { users: rows.map((r) => r.follower), pagination: buildMeta(count, page, limit) };
};

const getFollowing = async (userId, query) => {
  const { page, limit, offset } = getPagination(query, 20);
  const { rows, count } = await Follow.findAndCountAll({
    where: { followerId: userId },
    include: [{ model: User, as: "following", attributes: userAttrs }],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
  return { users: rows.map((r) => r.following), pagination: buildMeta(count, page, limit) };
};

// New recipes + new reviews from people you follow, newest first
const getFeed = async (userId, query) => {
  const { page, limit, offset } = getPagination(query, 10);

  const rows = await Follow.findAll({
    where: { followerId: userId },
    attributes: ["followingId"],
    raw: true,
  });
  const ids = rows.map((r) => r.followingId);
  if (!ids.length) return { items: [], page, limit, hasMore: false };

  const take = page * limit;
  const actor = { attributes: ["id", "name", "avatar"] };

  const [recipes, reviews] = await Promise.all([
    Recipe.findAll({
      where: { userId: { [Op.in]: ids } },
      attributes: { exclude: ["instructions", "imagePublicId"] },
      include: [{ model: User, as: "author", ...actor }],
      order: [["createdAt", "DESC"]],
      limit: take,
    }),
    Review.findAll({
      where: { userId: { [Op.in]: ids } },
      include: [
        { model: User, as: "user", ...actor },
        { model: Recipe, as: "recipe", attributes: ["id", "title", "image"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: take,
    }),
  ]);

  const merged = [
    ...recipes.map((r) => ({
      type: "recipe",
      createdAt: r.createdAt,
      actor: r.author,
      recipe: r,
    })),
    ...reviews.map((rv) => ({
      type: "review",
      createdAt: rv.createdAt,
      actor: rv.user,
      recipe: rv.recipe,
      review: { id: rv.id, rating: rv.rating, comment: rv.comment },
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    items: merged.slice(offset, offset + limit),
    page,
    limit,
    hasMore: merged.length > offset + limit,
  };
};

module.exports = { follow, unfollow, getFollowers, getFollowing, getFeed };