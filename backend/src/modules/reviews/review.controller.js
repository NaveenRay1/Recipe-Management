const asyncHandler = require("../../utils/asyncHandler");
const service = require("./review.service");

const create = asyncHandler(async (req, res) => {
  const review = await service.createReview(req.user.id, req.params.recipeId, req.body);
  res.status(201).json({ success: true, message: "Review added", data: { review } });
});

const listForRecipe = asyncHandler(async (req, res) => {
  const data = await service.listReviews(req.params.recipeId, req.query);
  res.json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const review = await service.updateReview(req.params.id, req.user, req.body);
  res.json({ success: true, message: "Review updated", data: { review } });
});

const remove = asyncHandler(async (req, res) => {
  await service.deleteReview(req.params.id, req.user);
  res.json({ success: true, message: "Review deleted" });
});

module.exports = { create, listForRecipe, update, remove };