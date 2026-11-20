const router=require("express").Router();
const {protect}=require("../middleware/auth.middleware");
const asyncHandler=require("../utils/asyncHandler");
const c=require("../controllers/dashboard.controller");
router.get("/summary",protect,asyncHandler(c.summary));
module.exports=router;
