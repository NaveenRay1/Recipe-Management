const router = require("express").Router();
const ctrl = require("./social.controller");
const { protect } = require("../../middleware/auth.middleware");

router.get("/feed", protect, ctrl.feed);
router.post("/follow/:userId", protect, ctrl.follow);
router.delete("/follow/:userId", protect, ctrl.unfollow);
router.get("/followers/:userId", ctrl.followers);
router.get("/following/:userId", ctrl.following);

module.exports = router;