const express = require("express");
const { getUserChats, createChat } = require("../controllers/chatController");

const router = express.Router();

router.get("/", getUserChats);
router.post("/", createChat);

module.exports = router;
