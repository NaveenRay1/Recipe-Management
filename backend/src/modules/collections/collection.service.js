const { Collection, Recipe, User } = require("../../database/models");
const ApiError = require("../../utils/ApiError");

const findOwned = async (id, userId) => {
  const collection = await Collection.findOne({ where: { id, userId } });
  if (!collection) throw new ApiError(404, "Collection not found");
  return collection;
};

const create = async (userId, { name, description }) => {
  if (!name || !name.trim()) throw new ApiError(400, "Collection name is required");
  return Collection.create({ userId, name: name.trim(), description: description || "" });
};

const list = async (userId) => {
  const collections = await Collection.findAll({
    where: { userId },
    include: [
      {
        model: Recipe,
        as: "recipes",
        attributes: ["id", "image"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return collections.map((c) => {
    const json = c.toJSON();
    json.recipesCount = json.recipes.length;
    json.recipes = json.recipes.slice(0, 4); // a few covers for the UI
    return json;
  });
};

const getOne = async (id, userId) => {
  const collection = await Collection.findOne({
    where: { id, userId },
    include: [
      {
        model: Recipe,
        as: "recipes",
        attributes: { exclude: ["instructions", "imagePublicId"] },
        through: { attributes: [] },
        include: [{ model: User, as: "author", attributes: ["id", "name", "avatar"] }],
      },
    ],
  });
  if (!collection) throw new ApiError(404, "Collection not found");
  return collection;
};

const update = async (id, userId, { name, description }) => {
  const collection = await findOwned(id, userId);
  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, "Collection name cannot be empty");
    collection.name = name.trim();
  }
  if (description !== undefined) collection.description = description;
  await collection.save();
  return collection;
};

const remove = async (id, userId) => {
  const collection = await findOwned(id, userId);
  await collection.destroy();
};

const addRecipe = async (id, userId, recipeId) => {
  const collection = await findOwned(id, userId);
  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) throw new ApiError(404, "Recipe not found");
  await collection.addRecipe(recipe);
};

const removeRecipe = async (id, userId, recipeId) => {
  const collection = await findOwned(id, userId);
  await collection.removeRecipe(Number(recipeId));
};

module.exports = { create, list, getOne, update, remove, addRecipe, removeRecipe };