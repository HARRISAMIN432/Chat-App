import jwt from "jsonwebtoken";
import User from "../models/User.js";

const connectedUsers = new Map();

export const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.user.username);

    connectedUsers.set(socket.userId, socket.id);

    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    socket.join(socket.userId);

    socket.broadcast.emit("userOnline", {
      userId: socket.userId,
      isOnline: true,
    });

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(
        `User ${socket.user.username} joined conversation ${conversationId}`
      );
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(
        `User ${socket.user.username} left conversation ${conversationId}`
      );
    });

    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit("userTyping", {
        userId: socket.userId,
        username: socket.user.username,
        isTyping,
      });
    });

    socket.on("messageDelivered", ({ messageId, conversationId }) => {
      socket.to(conversationId).emit("messageDelivered", {
        messageId,
        deliveredBy: socket.userId,
      });
    });

    socket.on("sendPrivateMessage", ({ recipientId, message }) => {
      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("privateMessage", {
          senderId: socket.userId,
          senderUsername: socket.user.username,
          message,
        });
      }
    });

    socket.on("updateStatus", async ({ status }) => {
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: status === "online",
          lastSeen: new Date(),
        });

        socket.broadcast.emit("userStatusUpdate", {
          userId: socket.userId,
          isOnline: status === "online",
          lastSeen: new Date(),
        });
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.user.username);

      connectedUsers.delete(socket.userId);

      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      socket.broadcast.emit("userOffline", {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date(),
      });
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  io.on("error", (error) => {
    console.error("Socket.IO server error:", error);
  });
};

export { connectedUsers };
