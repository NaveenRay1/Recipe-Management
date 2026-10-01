const asyncHandler = require("../../utils/asyncHandler");
const service = require("./favorite.service");

const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.listFavorites(req.user.id, req.query) });
});

const add = asyncHandler(async (req, res) => {
  await service.addFavorite(req.user.id, req.params.recipeId);
  res.status(201).json({ success: true, message: "Added to favorites" });
});

const remove = asyncHandler(async (req, res) => {
  await service.removeFavorite(req.user.id, req.params.recipeId);
  res.json({ success: true, message: "Removed from favorites" });
});

module.exports = { list, add, remove };