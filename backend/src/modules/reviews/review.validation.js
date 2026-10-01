const Joi = require("joi");

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().allow("").max(2000).default(""),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().trim().allow("").max(2000),
}).min(1);

module.exports = { createReviewSchema, updateReviewSchema };