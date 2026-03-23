// index.js
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const questionRoutes = require("./routes/questionRoutes");

const app = express();

app.use(express.json());
app.use("/api/questions", questionRoutes);

const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB(); // wait until DB is connected
    console.log("MongoDB connection successful ✅");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (err) {
    console.error("Failed to start server due to MongoDB error:", err);
    process.exit(1); // stop the process if DB fails
  }
};

startServer();