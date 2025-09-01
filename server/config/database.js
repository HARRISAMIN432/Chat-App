import mongoose from "mongoose";

export const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI + "/chat-app")
    .then(() => {
      console.log("Database connected");
    })
    .catch(() => {
      console.log("Failed to connect database");
    });
};
