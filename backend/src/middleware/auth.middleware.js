const jwt = require("jsonwebtoken");
const { User } = require("../database/models");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const getToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.split(" ")[1]; // handy for Postman
  return null;
};

// Requires a valid login
const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new ApiError(401, "Not authenticated");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findByPk(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists");
  if (user.status === "banned") throw new ApiError(403, "Your account has been banned");
  if (user.status === "pending") throw new ApiError(403, "Your account is awaiting approval");

  req.user = user;
  next();
});

// Attaches req.user if logged in, but never blocks
const optionalAuth = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user && user.status === "active") req.user = user;
    }
  } catch {
    // ignore invalid token on public routes
  }
  next();
};

module.exports = { protect, optionalAuth };