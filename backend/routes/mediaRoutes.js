import express from "express";
import {
  uploadChatImage,
  uploadProfileImage,
} from "../controllers/mediaController.js";
import { uploadImage, uploadProfilePic } from "../utils/cloudinary.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/upload-chat-image",
  authenticateToken,
  uploadImage.single("image"),
  uploadChatImage
);
router.post(
  "/upload-profile-image",
  authenticateToken,
  uploadProfilePic.single("profilePic"),
  uploadProfileImage
);

export default router;
