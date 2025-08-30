const express = require("express");
const {
  getAllUsers,
  getUserProfile,
  updateProfile,
  searchUsers,
} = require("../controllers/userController");
const upload = require("../middleware/upload");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, getAllUsers);
router.get("/profile", authenticateToken, getUserProfile);
router.put(
  "/profile",
  authenticateToken,
  upload.single("avatar"),
  updateProfile
);
router.get("/search", authenticateToken, searchUsers);

module.exports = router;
