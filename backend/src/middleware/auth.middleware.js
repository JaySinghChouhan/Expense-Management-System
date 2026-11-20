const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success:false, message:"Authentication required" });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch { return res.status(401).json({ success:false, message:"Invalid or expired token" }); }
  const user = await User.findById(payload.sub);
  if (!user || !user.active) return res.status(401).json({ success:false, message:"User account unavailable" });
  req.user = user;
  next();
});
exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ success:false, message:"Admin access required" });
  next();
};
