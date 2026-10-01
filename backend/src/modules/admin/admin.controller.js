const asyncHandler = require("../../utils/asyncHandler");
const adminService = require("./admin.service");
const recipeService = require("../recipes/recipe.service");

const stats = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await adminService.getStats() });
});

const listUsers = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await adminService.listUsers(req.query) });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus(
    req.params.id,
    req.body?.status,
    req.user.id
  );
  res.json({ success: true, message: `User is now ${user.status}`, data: { user } });
});

const listRecipes = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await recipeService.listRecipes(req.query) });
});

const deleteRecipe = asyncHandler(async (req, res) => {
  await recipeService.deleteRecipe(req.params.id, req.user); // admin passes the ownership check
  res.json({ success: true, message: "Recipe removed" });
});

module.exports = { stats, listUsers, updateUserStatus, listRecipes, deleteRecipe };