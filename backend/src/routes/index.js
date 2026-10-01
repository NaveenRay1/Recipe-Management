const router = require("express").Router();

router.use("/auth", require("../modules/auth/auth.routes"));
router.use("/users", require("../modules/users/user.routes"));
router.use("/recipes", require("../modules/recipes/recipe.routes"));
router.use("/categories", require("../modules/categories/category.routes"));
router.use("/favorites", require("../modules/favorites/favorite.routes"));
router.use("/collections", require("../modules/collections/collection.routes"));
router.use("/reviews", require("../modules/reviews/review.routes"));
router.use("/social", require("../modules/social/social.routes"));
router.use("/admin", require("../modules/admin/admin.routes"));

module.exports = router;