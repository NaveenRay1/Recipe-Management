const asyncHandler = require("../../utils/asyncHandler");
const cookieOptions = require("../../utils/cookieOptions");
const authService = require("./auth.service");

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res
    .cookie("token", token, cookieOptions)
    .status(201)
    .json({ success: true, message: "Registered successfully", data: { user } });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res
    .cookie("token", token, cookieOptions)
    .json({ success: true, message: "Logged in successfully", data: { user } });
});

const logout = asyncHandler(async (req, res) => {
  const { maxAge, ...clearOptions } = cookieOptions;
  res
    .clearCookie("token", clearOptions)
    .json({ success: true, message: "Logged out successfully" });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

module.exports = { register, login, logout, me };