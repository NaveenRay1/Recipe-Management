const { sequelize } = require("../../config/db");

const Follow = sequelize.define(
  "Follow",
  {},
  {
    tableName: "follows",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["followerId", "followingId"] }],
  }
);

module.exports = Follow;