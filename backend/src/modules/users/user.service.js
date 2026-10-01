const { User, Recipe, Favorite, Follow } = require("../../database/models");
const ApiError = require("../../utils/ApiError");
const { uploadImage } = require("../../utils/upload");

const getCounts = async (userId) => {
  const [recipes, favorites, followers, following] = await Promise.all([
    Recipe.count({ where: { userId } }),
    Favorite.count({ where: { userId } }),
    Follow.count({ where: { followingId: userId } }),
    Follow.count({ where: { followerId: userId } }),
  ]);
  return { recipes, favorites, followers, following };
};

const getMyProfile = async (user) => ({
  user,
  counts: await getCounts(user.id),
});

const updateProfile = async (user, body, file) => {
  const { name, bio } = body || {};

  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, "Name cannot be empty");
    user.name = name.trim();
  }
  if (bio !== undefined) user.bio = bio;
  if (file) {
    const { url } = await uploadImage(file.buffer, "avatars");
    user.avatar = url;
  }

  await user.save();
  return user;
};

const getPublicProfile = async (id, viewerId) => {
  const user = await User.findByPk(id, {
    attributes: ["id", "name", "bio", "avatar", "status", "createdAt"],
  });
  if (!user || user.status !== "active") throw new ApiError(404, "User not found");

  const isFollowing = viewerId
    ? (await Follow.count({ where: { followerId: viewerId, followingId: user.id } })) > 0
    : false;

  return { user, counts: await getCounts(user.id), isFollowing };
};

module.exports = { getMyProfile, updateProfile, getPublicProfile };