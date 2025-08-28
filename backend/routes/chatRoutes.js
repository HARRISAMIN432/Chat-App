import express from "express";
import {
  createOrGetConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessageAsSeen,
  markConversationAsSeen,
} from "../controllers/chatController.js";
import { validateMessage } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, createOrGetConversation);
router.get("/", authenticateToken, getUserConversations);
router.get(
  "/:conversationId/messages",
  authenticateToken,
  getConversationMessages
);
router.post(
  "/:conversationId/messages",
  authenticateToken,
  validateMessage,
  sendMessage
);
router.put(
  "/:conversationId/messages/:messageId/seen",
  authenticateToken,
  markMessageAsSeen
);
router.put("/:conversationId/seen", authenticateToken, markConversationAsSeen);

export default router;
