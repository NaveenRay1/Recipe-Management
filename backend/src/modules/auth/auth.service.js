const bcrypt = require("bcryptjs");
const { User } = require("../../database/models");
const ApiError = require("../../utils/ApiError");
const generateToken = require("../../utils/generateToken");

const register = async ({ name, email, password }) => {
  const exists = await User.findOne({ where: { email } });
  if (exists) throw new ApiError(409, "Email is already registered");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  return { user, token: generateToken(user.id) };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.status === "banned") throw new ApiError(403, "Your account has been banned");
  if (user.status === "pending") throw new ApiError(403, "Your account is awaiting approval");

  return { user, token: generateToken(user.id) };
};

module.exports = { register, login };