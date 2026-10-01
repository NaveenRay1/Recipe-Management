const asyncHandler = require("../../utils/asyncHandler");
const service = require("./category.service");

const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { categories: await service.list() } });
});

const create = asyncHandler(async (req, res) => {
  const category = await service.create(req.body?.name);
  res.status(201).json({ success: true, message: "Category created", data: { category } });
});

const update = asyncHandler(async (req, res) => {
  const category = await service.update(req.params.id, req.body?.name);
  res.json({ success: true, message: "Category updated", data: { category } });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.json({ success: true, message: "Category deleted" });
});

module.exports = { list, create, update, remove };