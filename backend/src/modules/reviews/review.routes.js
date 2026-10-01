const router = require("express").Router();
const ctrl = require("./review.controller");
const validate = require("../../middleware/validate.middleware");
const { protect } = require("../../middleware/auth.middleware");
const { createReviewSchema, updateReviewSchema } = require("./review.validation");

router.get("/recipe/:recipeId", ctrl.listForRecipe);
router.post("/recipe/:recipeId", protect, validate(createReviewSchema), ctrl.create);
router.put("/:id", protect, validate(updateReviewSchema), ctrl.update);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;