require("dotenv").config();
const express = require("express");

const imageRoutes = require("./routes/imageRoutes");

const app = express();

app.use(express.json());

app.use("/api/images", imageRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});