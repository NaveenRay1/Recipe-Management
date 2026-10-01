const router = require("express").Router();
const ctrl = require("./collection.controller");
const { protect } = require("../../middleware/auth.middleware");

router.use(protect);

router.post("/", ctrl.create);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
router.post("/:id/recipes/:recipeId", ctrl.addRecipe);
router.delete("/:id/recipes/:recipeId", ctrl.removeRecipe);

module.exports = router;