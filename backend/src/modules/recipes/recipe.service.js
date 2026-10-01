const { Op } = require("sequelize");
const {
  sequelize,
  Recipe,
  User,
  Ingredient,
  Category,
  RecipeCategory,
  Favorite,
} = require("../../database/models");
const ApiError = require("../../utils/ApiError");
const { uploadImage, deleteImage } = require("../../utils/upload");
const { getPagination, buildMeta } = require("../../utils/pagination");

const authorInclude = { model: User, as: "author", attributes: ["id", "name", "avatar"] };
const categoryInclude = {
  model: Category,
  as: "categories",
  attributes: ["id", "name", "slug"],
  through: { attributes: [] },
};

const SORTS = {
  newest: [["createdAt", "DESC"]],
  oldest: [["createdAt", "ASC"]],
  rating: [["avgRating", "DESC"], ["ratingCount", "DESC"]],
  quickest: [["prepTime", "ASC"]],
};

const listRecipes = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  const idFilters = []; // each entry is an AND-ed "id IN (...)" filter

  // keyword search: title, description or ingredient name
  if (query.q) {
    const like = `%${query.q.trim()}%`;
    const ing = await Ingredient.findAll({
      where: { name: { [Op.iLike]: like } },
      attributes: ["recipeId"],
      raw: true,
    });
    where[Op.or] = [
      { title: { [Op.iLike]: like } },
      { description: { [Op.iLike]: like } },
      { id: { [Op.in]: ing.map((i) => i.recipeId) } },
    ];
  }

  // ?ingredient=chicken,garlic -> recipe must contain all of them
  if (query.ingredient) {
    const terms = query.ingredient.split(",").map((t) => t.trim()).filter(Boolean);
    for (const term of terms) {
      const rows = await Ingredient.findAll({
        where: { name: { [Op.iLike]: `%${term}%` } },
        attributes: ["recipeId"],
        raw: true,
      });
      idFilters.push(rows.map((r) => r.recipeId));
    }
  }

  // ?category=desserts (slug) or ?category=3 (id)
  if (query.category) {
    const cat = await Category.findOne({
      where: /^\d+$/.test(query.category)
        ? { id: Number(query.category) }
        : { slug: query.category },
    });
    if (!cat) {
      idFilters.push([]);
    } else {
      const rows = await RecipeCategory.findAll({
        where: { categoryId: cat.id },
        attributes: ["recipeId"],
        raw: true,
      });
      idFilters.push(rows.map((r) => r.recipeId));
    }
  }

  if (idFilters.length) {
    where[Op.and] = idFilters.map((ids) => ({ id: { [Op.in]: ids } }));
  }

  // filters
  if (query.userId) where.userId = query.userId;
  if (query.vegetarian === "true") where.isVegetarian = true;
  if (query.vegan === "true") where.isVegan = true;
  if (query.glutenFree === "true") where.isGlutenFree = true;
  if (query.difficulty) where.difficulty = query.difficulty;
  if (query.maxPrepTime) where.prepTime = { [Op.lte]: Number(query.maxPrepTime) };
  if (query.maxCookTime) where.cookTime = { [Op.lte]: Number(query.maxCookTime) };
  if (query.minRating) where.avgRating = { [Op.gte]: Number(query.minRating) };

  const { rows, count } = await Recipe.findAndCountAll({
    where,
    attributes: { exclude: ["instructions", "imagePublicId"] },
    include: [authorInclude, categoryInclude],
    order: SORTS[query.sort] || SORTS.newest,
    limit,
    offset,
    distinct: true,
  });

  return { recipes: rows, pagination: buildMeta(count, page, limit) };
};

const getRecipe = async (id, userId) => {
  const recipe = await Recipe.findByPk(id, {
    attributes: { exclude: ["imagePublicId"] },
    include: [
      authorInclude,
      { model: Ingredient, as: "ingredients", attributes: ["id", "name", "quantity"] },
      categoryInclude,
    ],
  });
  if (!recipe) throw new ApiError(404, "Recipe not found");

  const data = recipe.toJSON();
  data.isFavorited = userId
    ? (await Favorite.count({ where: { userId, recipeId: recipe.id } })) > 0
    : false;
  return data;
};

const createRecipe = async (userId, body, file) => {
  const { ingredients, categoryIds, ...fields } = body;

  let image = null;
  let imagePublicId = null;
  if (file) {
    const uploaded = await uploadImage(file.buffer, "recipes");
    image = uploaded.url;
    imagePublicId = uploaded.publicId;
  }

  const t = await sequelize.transaction();
  try {
    const recipe = await Recipe.create(
      { ...fields, userId, image, imagePublicId },
      { transaction: t }
    );
    await Ingredient.bulkCreate(
      ingredients.map((i) => ({ ...i, recipeId: recipe.id })),
      { transaction: t }
    );
    if (categoryIds.length) {
      const cats = await Category.findAll({ where: { id: categoryIds } });
      await recipe.setCategories(cats, { transaction: t });
    }
    await t.commit();
    return getRecipe(recipe.id, userId);
  } catch (err) {
    await t.rollback();
    await deleteImage(imagePublicId);
    throw err;
  }
};

const findEditable = async (id, user) => {
  const recipe = await Recipe.findByPk(id);
  if (!recipe) throw new ApiError(404, "Recipe not found");
  if (recipe.userId !== user.id && user.role !== "admin") {
    throw new ApiError(403, "You can only modify your own recipes");
  }
  return recipe;
};

const updateRecipe = async (id, user, body, file) => {
  const recipe = await findEditable(id, user);
  const { ingredients, categoryIds, ...fields } = body;

  let newImage = null;
  if (file) newImage = await uploadImage(file.buffer, "recipes");
  const oldPublicId = recipe.imagePublicId;

  const t = await sequelize.transaction();
  try {
    if (newImage) {
      fields.image = newImage.url;
      fields.imagePublicId = newImage.publicId;
    }
    await recipe.update(fields, { transaction: t });

    if (ingredients) {
      await Ingredient.destroy({ where: { recipeId: recipe.id }, transaction: t });
      await Ingredient.bulkCreate(
        ingredients.map((i) => ({ ...i, recipeId: recipe.id })),
        { transaction: t }
      );
    }
    if (categoryIds) {
      const cats = await Category.findAll({ where: { id: categoryIds } });
      await recipe.setCategories(cats, { transaction: t });
    }
    await t.commit();
  } catch (err) {
    await t.rollback();
    if (newImage) await deleteImage(newImage.publicId);
    throw err;
  }

  if (newImage) await deleteImage(oldPublicId);
  return getRecipe(recipe.id, user.id);
};

const deleteRecipe = async (id, user) => {
  const recipe = await findEditable(id, user);
  const publicId = recipe.imagePublicId;
  await recipe.destroy();
  await deleteImage(publicId);
};

module.exports = { listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe };