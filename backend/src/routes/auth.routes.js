const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const ctrl = require("../controllers/auth.controller");
router.post("/register", [body("name").trim().notEmpty(), body("email").isEmail(), body("password").isLength({min:8}), validate], asyncHandler(ctrl.register));
router.post("/login", [body("email").isEmail(), body("password").notEmpty(), validate], asyncHandler(ctrl.login));
module.exports = router;
