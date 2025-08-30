const Chat = require("../models/Chat");

const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "-password")
      .populate("lastMessageSender", "fullName profilePic")
      .sort({ lastMessageTime: -1 });

    const formattedChats = chats.map((chat) => {
      const otherUser = chat.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      return {
        _id: chat._id,
        user: otherUser,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        lastMessageSender: chat.lastMessageSender,
        createdAt: chat.createdAt,
      };
    });

    res.json({
      success: true,
      chats: formattedChats,
    });
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const createChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId || userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] },
    });

    if (existingChat) {
      return res.json({
        success: true,
        message: "Chat already exists",
        chatId: existingChat._id,
      });
    }

    const newChat = new Chat({
      participants: [currentUserId, userId],
    });

    await newChat.save();

    res.status(201).json({
      success: true,
      message: "Chat created successfully",
      chatId: newChat._id,
    });
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getUserChats,
  createChat,
};
