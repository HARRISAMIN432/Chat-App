const Message = require("../models/Message");
const Chat = require("../models/Chat");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;
    const messageImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!receiverId || (!text && !messageImage)) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message content are required",
      });
    }

    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
      });
      await chat.save();
    }

    const message = new Message({
      chatId: chat._id,
      senderId,
      receiverId,
      text: text || "",
      image: messageImage,
    });

    await message.save();

    await message.populate("senderId", "fullName profilePic");
    await message.populate("receiverId", "fullName profilePic");

    chat.lastMessage = text || "Image";
    chat.lastMessageTime = new Date();
    chat.lastMessageSender = senderId;
    await chat.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${receiverId}`).emit("newMessage", {
        _id: message._id,
        chatId: message.chatId,
        senderId: message.senderId._id,
        receiverId: message.receiverId._id,
        text: message.text,
        image: message.image,
        createdAt: message.createdAt,
        sender: message.senderId,
        receiver: message.receiverId,
      });

      io.to(`user_${senderId}`).emit("messageSent", {
        _id: message._id,
        chatId: message.chatId,
        senderId: message.senderId._id,
        receiverId: message.receiverId._id,
        text: message.text,
        image: message.image,
        createdAt: message.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        _id: message._id,
        chatId: message.chatId,
        senderId: message.senderId._id,
        receiverId: message.receiverId._id,
        text: message.text,
        image: message.image,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId })
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] },
    });

    if (!chat) {
      return res.json({
        success: true,
        messages: [],
        chatId: null,
      });
    }

    const messages = await Message.find({ chatId: chat._id })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
      chatId: chat._id,
    });
  } catch (error) {
    console.error("Get chat messages error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${message.senderId}`).emit("messageRead", {
        messageId: message._id,
        readBy: userId,
        readAt: message.readAt,
      });
    }

    res.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Mark message as read error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getChatMessages,
  markMessageAsRead,
};
