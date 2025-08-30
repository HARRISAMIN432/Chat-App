const express = require("express");
const {
  sendMessage,
  getMessages,
  getChatMessages,
  markMessageAsRead,
} = require("../controllers/messageController");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/send", upload.single("image"), sendMessage);
router.get("/chat/:chatId", getMessages);
router.get("/user/:userId", getChatMessages);
router.put("/read/:messageId", markMessageAsRead);

module.exports = router;
