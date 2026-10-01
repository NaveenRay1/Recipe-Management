const { Op } = require("sequelize");
const { User, Recipe, Review } = require("../../database/models");
const ApiError = require("../../utils/ApiError");
const { getPagination, buildMeta } = require("../../utils/pagination");

const listUsers = async (query) => {
  const { page, limit, offset } = getPagination(query, 20);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.role) where.role = query.role;
  if (query.q) {
    const like = `%${query.q.trim()}%`;
    where[Op.or] = [{ name: { [Op.iLike]: like } }, { email: { [Op.iLike]: like } }];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
  return { users: rows, pagination: buildMeta(count, page, limit) };
};

const updateUserStatus = async (id, status, adminId) => {
  if (!["active", "pending", "banned"].includes(status)) {
    throw new ApiError(400, "status must be one of: active, pending, banned");
  }
  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.id === adminId) throw new ApiError(400, "You cannot change your own status");
  if (user.role === "admin") throw new ApiError(403, "You cannot change another admin's status");

  user.status = status;
  await user.save();
  return user;
};

const getStats = async () => {
  const [users, bannedUsers, pendingUsers, recipes, reviews] = await Promise.all([
    User.count(),
    User.count({ where: { status: "banned" } }),
    User.count({ where: { status: "pending" } }),
    Recipe.count(),
    Review.count(),
  ]);
  return { users, bannedUsers, pendingUsers, recipes, reviews };
};

module.exports = { listUsers, updateUserStatus, getStats };