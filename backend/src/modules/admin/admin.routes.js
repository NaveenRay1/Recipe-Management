const router = require("express").Router();
const ctrl = require("./admin.controller");
const { protect } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

router.use(protect, authorize("admin"));

router.get("/stats", ctrl.stats);
router.get("/users", ctrl.listUsers);
router.patch("/users/:id/status", ctrl.updateUserStatus);
router.get("/recipes", ctrl.listRecipes);
router.delete("/recipes/:id", ctrl.deleteRecipe);

module.exports = router;