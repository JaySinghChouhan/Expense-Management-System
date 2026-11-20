const mongoose = require("mongoose");
const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  date: { type: Date, required: true },
  paymentMethod: { type: String, enum: ["Cash","Card","UPI","Bank Transfer","Other"], required: true },
  description: { type: String, default: "", maxlength: 1000 },
  status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null },
  reviewComment: { type: String, default: "" },
  isDeleted: { type: Boolean, default: false, index: true },
  version: { type: Number, default: 0 }
}, { timestamps: true });
expenseSchema.index({ createdBy: 1, date: -1 });
expenseSchema.index({ status: 1, category: 1, date: -1 });
module.exports = mongoose.model("Expense", expenseSchema);
