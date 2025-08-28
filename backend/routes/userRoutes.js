import express from "express";
import {
  getUserProfile,
  updateProfile,
  updatePassword,
  searchUsers,
} from "../controllers/userController.js";
import {
  validateUpdateProfile,
  validatePasswordChange,
} from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/search", authenticateToken, searchUsers);
router.get("/:id", authenticateToken, getUserProfile);
router.put("/update", authenticateToken, validateUpdateProfile, updateProfile);
router.put(
  "/update-password",
  authenticateToken,
  validatePasswordChange,
  updatePassword
);

export default router;
