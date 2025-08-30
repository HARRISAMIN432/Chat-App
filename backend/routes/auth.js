const express = require("express");
const { body } = require("express-validator");
const { signup, signin, logout } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");

const router = express.Router();

router.post(
  "/signup",
  [
    body("fullName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Full name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    handleValidationErrors,
  ],
  signup
);

router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
  ],
  signin
);
router.post("/logout", authenticateToken, logout);

module.exports = router;
