import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    groupPic: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
