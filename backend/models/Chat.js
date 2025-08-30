const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    next(new Error("Chat must have exactly 2 participants"));
  }
  next();
});

chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model("Chat", chatSchema);
