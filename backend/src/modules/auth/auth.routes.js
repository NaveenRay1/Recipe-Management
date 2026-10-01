const router = require("express").Router();
const ctrl = require("./auth.controller");
const validate = require("../../middleware/validate.middleware");
const { protect } = require("../../middleware/auth.middleware");
const { registerSchema, loginSchema } = require("./auth.validation");

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login", validate(loginSchema), ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", protect, ctrl.me);

module.exports = router;