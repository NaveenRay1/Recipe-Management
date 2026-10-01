const asyncHandler = require("../../utils/asyncHandler");
const recipeService = require("./recipe.service");

const list = asyncHandler(async (req, res) => {
  const data = await recipeService.listRecipes(req.query);
  res.json({ success: true, data });
});

const getOne = asyncHandler(async (req, res) => {
  const recipe = await recipeService.getRecipe(req.params.id, req.user?.id);
  res.json({ success: true, data: { recipe } });
});

const create = asyncHandler(async (req, res) => {
  const recipe = await recipeService.createRecipe(req.user.id, req.body, req.file);
  res.status(201).json({ success: true, message: "Recipe created", data: { recipe } });
});

const update = asyncHandler(async (req, res) => {
  const recipe = await recipeService.updateRecipe(
    req.params.id,
    req.user,
    req.body,
    req.file
  );
  res.json({ success: true, message: "Recipe updated", data: { recipe } });
});

const remove = asyncHandler(async (req, res) => {
  await recipeService.deleteRecipe(req.params.id, req.user);
  res.json({ success: true, message: "Recipe deleted" });
});

module.exports = { list, getOne, create, update, remove };