import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getAllUsers,
  getMessages,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", authenticate, getAllUsers);
router.get("/:id", authenticate, getMessages);
router.put("/mark/:id", authenticate, markMessageAsSeen);
router.post("/send/:id", authenticate, sendMessage);

export default router;
