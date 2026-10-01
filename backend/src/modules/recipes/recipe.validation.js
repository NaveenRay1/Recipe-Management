const Joi = require("joi");

const ingredientSchema = Joi.object({
  name: Joi.string().trim().max(150).required(),
  quantity: Joi.string().trim().allow("").max(100).default(""),
});

// defaults only apply on create, so an update never overwrites fields you didn't send
const buildSchema = (create) => {
  const req = (s) => (create ? s.required() : s.optional());
  const def = (s, v) => (create ? s.default(v) : s);

  return Joi.object({
    title: req(Joi.string().trim().min(3).max(150)),
    description: def(Joi.string().trim().allow("").max(2000), ""),
    instructions: req(Joi.string().trim().min(5)),
    prepTime: def(Joi.number().integer().min(0), 0),
    cookTime: def(Joi.number().integer().min(0), 0),
    servings: def(Joi.number().integer().min(1), 1),
    difficulty: def(Joi.string().valid("easy", "medium", "hard"), "easy"),
    isVegetarian: def(Joi.boolean(), false),
    isVegan: def(Joi.boolean(), false),
    isGlutenFree: def(Joi.boolean(), false),
    ingredients: req(Joi.array().items(ingredientSchema).min(1)),
    categoryIds: def(Joi.array().items(Joi.number().integer()), []),
  });
};

module.exports = {
  createRecipeSchema: buildSchema(true),
  updateRecipeSchema: buildSchema(false),
};