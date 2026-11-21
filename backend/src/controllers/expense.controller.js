const mongoose = require("mongoose");
const Expense = require("../models/Expense");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function scopedQuery(req) {
  const q = { isDeleted:false };
  if (req.user.role !== "admin") q.createdBy = req.user._id;
  if (req.query.status) q.status = req.query.status;
  if (req.query.category) q.category = req.query.category;
  const from = parseDate(req.query.from);
  const to = parseDate(req.query.to);
  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = from;
    if (to) q.date.$lte = to;
  }
  if (req.query.search) {
    const pattern = escapeRegex(req.query.search).slice(0, 80);
    q.$or = [
      { title:{ $regex:pattern, $options:"i" } },
      { description:{ $regex:pattern, $options:"i" } },
      { category:{ $regex:pattern, $options:"i" } }
    ];
  }
  return q;
}
exports.list = async (req,res) => {
  const page = Math.max(1, parseInt(req.query.page,10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit,10) || 10));
  const allowed = ["date","amount","title","createdAt"];
  const sortBy = allowed.includes(req.query.sortBy) ? req.query.sortBy : "date";
  const sort = { [sortBy]: req.query.order === "asc" ? 1 : -1 };
  const query = scopedQuery(req);
  const [items,total] = await Promise.all([
    Expense.find(query).populate("createdBy","name email").populate("reviewedBy","name").sort(sort).skip((page-1)*limit).limit(limit),
    Expense.countDocuments(query)
  ]);
  res.json({success:true,data:items,meta:{page,limit,total,totalPages:Math.ceil(total/limit)}});
};
exports.getOne = async (req,res) => {
  const q = { _id:req.params.id, isDeleted:false };
  if(req.user.role !== "admin") q.createdBy=req.user._id;
  const item=await Expense.findOne(q).populate("createdBy","name email").populate("reviewedBy","name");
  if(!item) return res.status(404).json({success:false,message:"Expense not found"});
  res.json({success:true,data:item});
};
exports.create = async (req,res) => {
  const {title,amount,category,date,paymentMethod,description}=req.body;
  if(!title || !category || !date || !paymentMethod || !String(description||"").trim() || !Number.isFinite(Number(amount)) || Number(amount)<=0)
    return res.status(400).json({success:false,message:"Title, positive amount, category, date, payment method and description are required"});
  const item=await Expense.create({title,amount:Number(amount),category,date,paymentMethod,description,createdBy:req.user._id});
  res.status(201).json({success:true,data:item});
};
exports.update = async (req,res) => {
  const q={_id:req.params.id,isDeleted:false,status:"pending"};
  if(req.user.role!=="admin") q.createdBy=req.user._id;
  const allowed=["title","amount","category","date","paymentMethod","description"];
  const updates={};
  allowed.forEach(k=>{if(req.body[k]!==undefined) updates[k]=req.body[k];});
  if(updates.amount!==undefined && (!Number.isFinite(Number(updates.amount)) || Number(updates.amount)<=0))
    return res.status(400).json({success:false,message:"Amount must be greater than zero"});
  if(updates.description!==undefined && !String(updates.description).trim())
    return res.status(400).json({success:false,message:"Description is required"});
  const version=Number(req.body.version);
  const item=await Expense.findOneAndUpdate({...q,version},{$set:{...updates,version:version+1}},{new:true,runValidators:true});
  if(!item) return res.status(409).json({success:false,message:"Expense not found, not editable, or changed by another request. Refresh and try again."});
  res.json({success:true,data:item});
};
exports.remove = async (req,res) => {
  const q={_id:req.params.id,isDeleted:false,status:"pending"};
  if(req.user.role!=="admin") q.createdBy=req.user._id;
  const item=await Expense.findOneAndUpdate(q,{$set:{isDeleted:true}},{new:true});
  if(!item) return res.status(404).json({success:false,message:"Pending expense not found"});
  res.json({success:true,message:"Expense moved to deleted state"});
};
async function updateInTransaction(filter, update) {
  const options = { new: true, runValidators: true };
  const populate = (query) => query.populate("createdBy", "name email").populate("reviewedBy", "name");
  const session = await mongoose.startSession();
  try {
    let item = null;
    await session.withTransaction(async () => {
      item = await populate(Expense.findOneAndUpdate(filter, update, { ...options, session }));
    });
    return item;
  } catch (err) {
    const unsupported = /Transaction numbers are only allowed|replica set/i.test(String(err && err.message));
    if (!unsupported) throw err;
    return populate(Expense.findOneAndUpdate(filter, update, options));
  } finally {
    await session.endSession();
  }
}

exports.review = async (req,res) => {
  const status=req.params.action==="approve"?"approved":"rejected";
  const item = await updateInTransaction(
    {_id:req.params.id,isDeleted:false,status:"pending"},
    {$set:{status,reviewedBy:req.user._id,reviewedAt:new Date(),reviewComment:String(req.body.comment||"").slice(0,500)},$inc:{version:1}}
  );
  if(!item) return res.status(409).json({success:false,message:"Expense not found or already reviewed"});
  res.json({success:true,data:item});
};
module.exports.scopedQuery=scopedQuery;
