// config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true); // optional, avoids deprecation warnings
    await mongoose.connect(process.env.MONGO_URI); // ✅ no extra options needed
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

module.exports = connectDB;