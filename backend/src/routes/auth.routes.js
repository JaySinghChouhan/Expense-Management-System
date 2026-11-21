const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const ctrl = require("../controllers/auth.controller");
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skip: () => process.env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." }
});
router.post("/register", [body("name").trim().notEmpty(), body("email").isEmail(), body("password").isLength({min:8}), validate], asyncHandler(ctrl.register));
router.post("/login", loginLimiter, [body("email").isEmail(), body("password").notEmpty(), validate], asyncHandler(ctrl.login));
module.exports = router;
