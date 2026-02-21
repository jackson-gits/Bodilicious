import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import { initProductCollection } from "./products/models.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(async () => {
    console.log("MongoDB connected");

    await initProductCollection();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
