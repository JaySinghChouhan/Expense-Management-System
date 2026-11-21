const router=require("express").Router();
const {query}=require("express-validator");
const {protect}=require("../middleware/auth.middleware");
const validate=require("../middleware/validate.middleware");
const asyncHandler=require("../utils/asyncHandler");
const c=require("../controllers/dashboard.controller");
router.get("/summary",protect,[query("year").optional().isInt({min:1900,max:9999}),validate],asyncHandler(c.summary));
module.exports=router;
