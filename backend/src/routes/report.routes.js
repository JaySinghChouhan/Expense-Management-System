const router=require("express").Router();
const {protect}=require("../middleware/auth.middleware");
const asyncHandler=require("../utils/asyncHandler");
const expenseQueryRules=require("./expense-query.rules");
const c=require("../controllers/report.controller");
router.get("/expenses/export",protect,expenseQueryRules,asyncHandler(c.exportCSV));
module.exports=router;
