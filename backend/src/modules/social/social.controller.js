const asyncHandler = require("../../utils/asyncHandler");
const service = require("./social.service");

const follow = asyncHandler(async (req, res) => {
  await service.follow(req.user.id, req.params.userId);
  res.status(201).json({ success: true, message: "Followed" });
});

const unfollow = asyncHandler(async (req, res) => {
  await service.unfollow(req.user.id, req.params.userId);
  res.json({ success: true, message: "Unfollowed" });
});

const followers = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getFollowers(req.params.userId, req.query) });
});

const following = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getFollowing(req.params.userId, req.query) });
});

const feed = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getFeed(req.user.id, req.query) });
});

module.exports = { follow, unfollow, followers, following, feed };