const { Category } = require("../../database/models");
const ApiError = require("../../utils/ApiError");

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const list = () => Category.findAll({ order: [["name", "ASC"]] });

const create = async (name) => {
  if (!name || !name.trim()) throw new ApiError(400, "Category name is required");
  return Category.create({ name: name.trim(), slug: slugify(name) });
};

const update = async (id, name) => {
  if (!name || !name.trim()) throw new ApiError(400, "Category name is required");
  const category = await Category.findByPk(id);
  if (!category) throw new ApiError(404, "Category not found");
  return category.update({ name: name.trim(), slug: slugify(name) });
};

const remove = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new ApiError(404, "Category not found");
  await category.destroy();
};

module.exports = { list, create, update, remove };