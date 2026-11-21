const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is required. Set it in backend/.env or in the host environment.");
  }

  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log("MongoDB connected successfully");
};
