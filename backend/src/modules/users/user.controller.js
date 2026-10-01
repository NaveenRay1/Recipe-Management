const asyncHandler = require("../../utils/asyncHandler");
const userService = require("./user.service");
const recipeService = require("../recipes/recipe.service");
const favoriteService = require("../favorites/favorite.service");

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await userService.getMyProfile(req.user) });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user, req.body, req.file);
  res.json({ success: true, message: "Profile updated", data: { user } });
});

const myRecipes = asyncHandler(async (req, res) => {
  const data = await recipeService.listRecipes({ ...req.query, userId: req.user.id });
  res.json({ success: true, data });
});

const myFavorites = asyncHandler(async (req, res) => {
  const data = await favoriteService.listFavorites(req.user.id, req.query);
  res.json({ success: true, data });
});

const getProfile = asyncHandler(async (req, res) => {
  const data = await userService.getPublicProfile(req.params.id, req.user?.id);
  res.json({ success: true, data });
});

const userRecipes = asyncHandler(async (req, res) => {
  const data = await recipeService.listRecipes({ ...req.query, userId: req.params.id });
  res.json({ success: true, data });
});

module.exports = { getMe, updateMe, myRecipes, myFavorites, getProfile, userRecipes };