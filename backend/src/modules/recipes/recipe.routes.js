const router = require("express").Router();
const ctrl = require("./recipe.controller");
const upload = require("../../middleware/upload.middleware");
const validate = require("../../middleware/validate.middleware");
const { protect, optionalAuth } = require("../../middleware/auth.middleware");
const ApiError = require("../../utils/ApiError");
const { createRecipeSchema, updateRecipeSchema } = require("./recipe.validation");

// multipart/form-data sends arrays as JSON strings, so parse them first
const parseJsonFields = (req, res, next) => {
  try {
    for (const key of ["ingredients", "categoryIds"]) {
      if (typeof req.body?.[key] === "string") {
        req.body[key] = JSON.parse(req.body[key]);
      }
    }
    next();
  } catch {
    next(new ApiError(400, "ingredients and categoryIds must be valid JSON"));
  }
};

router.get("/", ctrl.list);
router.get("/:id", optionalAuth, ctrl.getOne);
router.post(
  "/",
  protect,
  upload.single("image"),
  parseJsonFields,
  validate(createRecipeSchema),
  ctrl.create
);
router.put(
  "/:id",
  protect,
  upload.single("image"),
  parseJsonFields,
  validate(updateRecipeSchema),
  ctrl.update
);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;