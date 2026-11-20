const jwt = require("jsonwebtoken");
exports.signToken = (user) => jwt.sign(
  { sub: user._id.toString(), role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
);
