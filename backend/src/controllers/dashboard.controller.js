const Expense=require("../models/Expense");
exports.summary=async(req,res)=>{
 const match={isDeleted:false};
 if(req.user.role!=="admin") match.createdBy=req.user._id;
 const now=new Date(), year=Number(req.query.year)||now.getFullYear();
 const yearMatch={...match,date:{$gte:new Date(year,0,1),$lt:new Date(year+1,0,1)}};
 const [totalAgg,monthly,byCategory,statuses,highest]=await Promise.all([
  Expense.aggregate([{$match:yearMatch},{$group:{_id:null,total:{$sum:"$amount"},count:{$sum:1}}}]),
  Expense.aggregate([{$match:yearMatch},{$group:{_id:{$month:"$date"},total:{$sum:"$amount"}}},{$sort:{_id:1}}]),
  Expense.aggregate([{$match:yearMatch},{$group:{_id:"$category",total:{$sum:"$amount"},count:{$sum:1}}},{$sort:{total:-1}}]),
  Expense.aggregate([{$match:match},{$group:{_id:"$status",count:{$sum:1}}}]),
  Expense.findOne(yearMatch).sort({amount:-1}).select("title amount category date")
 ]);
 const monthNames=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
 const monthMap=Object.fromEntries(monthly.map(x=>[x._id,x.total]));
 const isCurrentYear=year===now.getFullYear();
 const monthNumber=isCurrentYear?now.getMonth()+1:null;
 res.json({success:true,data:{
  year,total:totalAgg[0]?.total||0,count:totalAgg[0]?.count||0,
  monthlyTotal:monthNumber? (monthMap[monthNumber]||0) : null,
  monthLabel:monthNumber? monthNames[monthNumber-1] : null,
  monthly:monthNames.map((name,i)=>({month:name,total:monthMap[i+1]||0})),
  categories:byCategory,statuses,highest
 }});
};
