const { stringify }=require("csv-stringify/sync");
const Expense=require("../models/Expense");
const {scopedQuery}=require("./expense.controller");
exports.exportCSV=async(req,res)=>{
 const rows=await Expense.find(scopedQuery(req)).populate("createdBy","name").sort({date:-1}).limit(5000).lean();
 const csv=stringify(rows.map(x=>({
  Title:x.title,Amount:x.amount,Category:x.category,Date:x.date?.toISOString().slice(0,10),
  PaymentMethod:x.paymentMethod,Status:x.status,CreatedBy:x.createdBy?.name||"",Description:x.description
 })),{header:true});
 res.setHeader("Content-Type","text/csv");
 res.setHeader("Content-Disposition",'attachment; filename="expenses-report.csv"');
 res.send(csv);
};
