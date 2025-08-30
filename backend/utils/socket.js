const jwt = require("jsonwebtoken");
const User = require("../models/User");

const connectedUsers = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication failed"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`User ${socket.user.fullName} connected`);

    connectedUsers.set(socket.userId, socket.id);

    socket.join(`user_${socket.userId}`);

    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    io.emit("onlineUsers", {
      onlineUserIds: Array.from(connectedUsers.keys()),
    });

    io.emit("userOnline", {
      userId: socket.userId,
      isOnline: true,
      lastSeen: new Date(),
    });

    socket.on("requestOnlineUsers", () => {
      console.log("Received requestOnlineUsers from", socket.userId);
      socket.emit("onlineUsers", {
        onlineUserIds: Array.from(connectedUsers.keys()),
      });
    });

    socket.on("joinChat", (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.user.fullName} joined chat ${chatId}`);
    });

    socket.on("leaveChat", (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${socket.user.fullName} left chat ${chatId}`);
    });

    socket.on("typing", (data) => {
      socket.to(`user_${data.receiverId}`).emit("userTyping", {
        userId: socket.userId,
        chatId: data.chatId,
        isTyping: true,
      });
    });

    socket.on("stopTyping", (data) => {
      socket.to(`user_${data.receiverId}`).emit("userTyping", {
        userId: socket.userId,
        chatId: data.chatId,
        isTyping: false,
      });
    });

    socket.on("messageRead", async (data) => {
      try {
        const Message = require("../models/Message");
        await Message.findByIdAndUpdate(data.messageId, {
          isRead: true,
          readAt: new Date(),
        });

        socket.to(`user_${data.senderId}`).emit("messageReadUpdate", {
          messageId: data.messageId,
          readBy: socket.userId,
          readAt: new Date(),
        });
      } catch (error) {
        console.error("Message read error:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`User ${socket.user.fullName} disconnected`);

      connectedUsers.delete(socket.userId);

      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit("userOnline", {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit("onlineUsers", {
        onlineUserIds: Array.from(connectedUsers.keys()),
      });
    });
  });
};

const getConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

module.exports = {
  initializeSocket,
  getConnectedUsers,
  connectedUsers,
};
