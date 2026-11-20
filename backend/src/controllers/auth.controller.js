const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/token");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8)
    return res.status(400).json({ success:false, message:"Name, valid email and password (8+ characters) are required" });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ success:false, message:"Email already registered" });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role:"user" });
  res.status(201).json({ success:true, data:{ token:signToken(user), user:{ id:user._id, name:user.name, email:user.email, role:user.role } } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() }).select("+password");
  if (!user || !user.active || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ success:false, message:"Invalid email or password" });
  res.json({ success:true, data:{ token:signToken(user), user:{ id:user._id, name:user.name, email:user.email, role:user.role } } });
};
