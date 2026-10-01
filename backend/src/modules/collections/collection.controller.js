const asyncHandler = require("../../utils/asyncHandler");
const service = require("./collection.service");

const create = asyncHandler(async (req, res) => {
  const collection = await service.create(req.user.id, req.body || {});
  res.status(201).json({ success: true, message: "Collection created", data: { collection } });
});

const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { collections: await service.list(req.user.id) } });
});

const getOne = asyncHandler(async (req, res) => {
  const collection = await service.getOne(req.params.id, req.user.id);
  res.json({ success: true, data: { collection } });
});

const update = asyncHandler(async (req, res) => {
  const collection = await service.update(req.params.id, req.user.id, req.body || {});
  res.json({ success: true, message: "Collection updated", data: { collection } });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user.id);
  res.json({ success: true, message: "Collection deleted" });
});

const addRecipe = asyncHandler(async (req, res) => {
  await service.addRecipe(req.params.id, req.user.id, req.params.recipeId);
  res.status(201).json({ success: true, message: "Recipe added to collection" });
});

const removeRecipe = asyncHandler(async (req, res) => {
  await service.removeRecipe(req.params.id, req.user.id, req.params.recipeId);
  res.json({ success: true, message: "Recipe removed from collection" });
});

module.exports = { create, list, getOne, update, remove, addRecipe, removeRecipe };