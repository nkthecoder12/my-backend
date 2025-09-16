const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in environment variables");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  isConnected = true;
  console.log("✅ Connected to MongoDB");
  return mongoose.connection;
}

module.exports = { connectDB };
