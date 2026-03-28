require("dotenv").config();
const express = require("express");
const cors = require("cors"); // <-- add this
const connectDB = require("./config/database");
const questionRoutes = require("./routes/questionRoutes");

const app = express();
app.use(express.json());

const whitelist = [
  process.env.FRONTEND_DEV,
  process.env.FRONTEND_PROD
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

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