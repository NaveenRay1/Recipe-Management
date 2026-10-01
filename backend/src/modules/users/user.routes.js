const router = require("express").Router();
const ctrl = require("./user.controller");
const upload = require("../../middleware/upload.middleware");
const { protect, optionalAuth } = require("../../middleware/auth.middleware");

// /me routes must come before /:id
router.get("/me", protect, ctrl.getMe);
router.put("/me", protect, upload.single("avatar"), ctrl.updateMe);
router.get("/me/recipes", protect, ctrl.myRecipes);
router.get("/me/favorites", protect, ctrl.myFavorites);

router.get("/:id", optionalAuth, ctrl.getProfile);
router.get("/:id/recipes", ctrl.userRecipes);

module.exports = router;