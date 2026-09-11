const express = require("express");

const {
    sendMessage,
    getMessages,
    getConversations
} = require("../controllers/messageController");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();


// Protect all message routes
router.use(protect);


// ============================================
// GET ALL CONVERSATIONS
// GET /api/messages/conversations
// ============================================

router.get(
    "/conversations",
    getConversations
);


// ============================================
// GET CHAT
// GET /api/messages/:listingId/:userId
// ============================================

router.get(
    "/:listingId/:userId",
    getMessages
);


// ============================================
// SEND MESSAGE
// POST /api/messages
// ============================================

router.post(
    "/",
    sendMessage
);


module.exports = router;