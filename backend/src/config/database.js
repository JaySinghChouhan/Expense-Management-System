const mongoose = require("mongoose");

module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required. Set it in backend/.env or in the host environment.");
  }
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("MongoDB connected");
};
