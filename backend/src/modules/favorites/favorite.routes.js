const router = require("express").Router();
const ctrl = require("./favorite.controller");
const { protect } = require("../../middleware/auth.middleware");

router.use(protect);

router.get("/", ctrl.list);
router.post("/:recipeId", ctrl.add);
router.delete("/:recipeId", ctrl.remove);

module.exports = router;