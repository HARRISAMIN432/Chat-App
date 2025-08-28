import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io } from "../server.js";

export const createOrGetConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user.id;

    if (participantId === currentUserId) {
      return res
        .status(400)
        .json({ message: "Cannot create conversation with yourself" });
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "User not found" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId] },
      isGroup: false,
    }).populate("participants", "username profilePic isOnline lastSeen");

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, participantId],
      });
      await conversation.save();
      await conversation.populate(
        "participants",
        "username profilePic isOnline lastSeen"
      );
    }

    res.json({ conversation });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating conversation", error: error.message });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate("participants", "username profilePic isOnline lastSeen")
      .populate("lastMessage", "text image sender createdAt messageType")
      .sort({ lastMessageTime: -1 });

    res.json({ conversations });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching conversations", error: error.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "username profilePic")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: currentUserId },
        "deliveredTo.user": { $ne: currentUserId },
      },
      {
        $push: {
          deliveredTo: {
            user: currentUserId,
            deliveredAt: new Date(),
          },
        },
      }
    );

    res.json({ messages: messages.reverse() });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, image } = req.body;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId,
    }).populate("participants", "username profilePic isOnline");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = new Message({
      conversationId,
      sender: currentUserId,
      text: text || "",
      image: image || "",
      messageType: image ? "image" : "text",
    });

    await message.save();
    await message.populate("sender", "username profilePic");

    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    const otherParticipants = conversation.participants.filter(
      (p) => p._id.toString() !== currentUserId
    );

    otherParticipants.forEach((participant) => {
      io.to(participant._id.toString()).emit("newMessage", {
        message,
        conversationId,
      });
    });

    res.status(201).json({ message });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: {
        seenBy: {
          user: currentUserId,
          seenAt: new Date(),
        },
      },
    });

    const message = await Message.findById(messageId).populate("sender");
    if (message && message.sender._id.toString() !== currentUserId) {
      io.to(message.sender._id.toString()).emit("messageSeen", {
        messageId,
        conversationId,
        seenBy: currentUserId,
      });
    }

    res.json({ message: "Message marked as seen" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error marking message as seen", error: error.message });
  }
};

export const markConversationAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mark all unseen messages in conversation as seen
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: currentUserId },
        "seenBy.user": { $ne: currentUserId },
      },
      {
        $addToSet: {
          seenBy: {
            user: currentUserId,
            seenAt: new Date(),
          },
        },
      }
    );

    res.json({ message: "Conversation marked as seen" });
  } catch (error) {
    res.status(500).json({
      message: "Error marking conversation as seen",
      error: error.message,
    });
  }
};
