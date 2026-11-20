const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Expense = require("../models/Expense");

const DEMO = {
  admin: { name: "System Admin", email: "admin@example.com", password: "Admin@12345", role: "admin" },
  user: { name: "Demo User", email: "user@example.com", password: "User@12345", role: "user" }
};

async function ensureUser(spec) {
  const existing = await User.findOne({ email: spec.email });
  if (existing) return existing;
  return User.create({
    name: spec.name,
    email: spec.email,
    password: await bcrypt.hash(spec.password, 12),
    role: spec.role
  });
}

async function seedDemo() {
  const admin = await ensureUser(DEMO.admin);
  const user = await ensureUser(DEMO.user);
  if (await Expense.countDocuments() === 0) {
    const today = new Date();
    await Expense.create([
      { title: "Office supplies", amount: 2500, category: "Office", date: today, paymentMethod: "UPI", description: "Stationery purchase", createdBy: user._id },
      { title: "Client travel", amount: 8400, category: "Travel", date: today, paymentMethod: "Card", description: "Cab to client site", createdBy: user._id, status: "approved", reviewedBy: admin._id, reviewedAt: today, reviewComment: "Approved for reimbursement" },
      { title: "Team lunch", amount: 1800, category: "Meals", date: today, paymentMethod: "Cash", description: "Project kickoff lunch", createdBy: user._id }
    ]);
  }
  return { adminEmail: DEMO.admin.email, userEmail: DEMO.user.email };
}

module.exports = seedDemo;
module.exports.DEMO = DEMO;
