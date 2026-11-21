const mongoose = require("mongoose");
let connectionPromise;

module.exports = async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is required. Set it in backend/.env or in the host environment.");
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    const pendingConnection = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    }).then(() => {
      console.log("MongoDB connected successfully");
      return mongoose.connection;
    });

    connectionPromise = pendingConnection;
    try {
      return await pendingConnection;
    } finally {
      if (connectionPromise === pendingConnection) connectionPromise = null;
    }
  }

  return connectionPromise;
};
