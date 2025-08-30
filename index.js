const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./backend/config/database");
const User = require("./backend/models/User");

dotenv.config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./backend/routes/auth"));
app.use("/api/users", require("./backend/routes/users"));
app.use("/api/chats", require("./backend/routes/chats"));
app.use("/api/messages", require("./backend/routes/messages"));
app.use("/api/upload", require("./backend/routes/upload"));

const resetOnlineStatus = async () => {
  try {
    await User.updateMany({}, { isOnline: false, lastSeen: new Date() });
    console.log("Reset all users' online status to false");
  } catch (error) {
    console.error("Error resetting online status:", error);
  }
};

connectDB().then(() => {
  resetOnlineStatus();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const { initializeSocket } = require("./backend/utils/socket");
initializeSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
