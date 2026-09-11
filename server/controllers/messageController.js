const Message = require("../models/Message");
const Listing = require("../models/Listing");
const User = require("../models/User");
const mongoose = require("mongoose");


// ============================================
// HELPERS
// ============================================

const validId = (id) => {
    return mongoose.isValidObjectId(id);
};

const sameId = (a, b) => {
    return String(a) === String(b);
};


// ============================================
// SEND MESSAGE
// POST /api/messages
// ============================================

const sendMessage = async (req, res) => {
    try {
        const {
            listingId,
            receiverId,
            message
        } = req.body;

        console.log(
            "SEND MESSAGE:",
            {
                listingId,
                receiverId,
                senderId:
                    req.user?._id
            }
        );

        // Validate IDs
        if (
            !validId(listingId) ||
            !validId(receiverId)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid listing or receiver."
            });
        }

        // Validate message
        const text =
            String(message || "").trim();

        if (!text) {
            return res.status(400).json({
                success: false,
                message:
                    "Message cannot be empty."
            });
        }

        if (text.length > 1000) {
            return res.status(400).json({
                success: false,
                message:
                    "Message cannot exceed 1000 characters."
            });
        }

        // Prevent self messaging
        if (
            sameId(
                req.user._id,
                receiverId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot message yourself."
            });
        }

        // Find listing WITHOUT populate
        // so owner ID can never disappear.
        const listing =
            await Listing.findById(
                listingId
            ).lean();

        if (!listing) {
            return res.status(404).json({
                success: false,
                message:
                    "Listing not found."
            });
        }

        // Find receiver
        const receiver =
            await User.findById(
                receiverId
            )
                .select(
                    "name email college"
                )
                .lean();

        if (!receiver) {
            return res.status(409).json({
                success: false,
                message:
                    "This seller account no longer exists. Please choose another listing."
            });
        }

        // ------------------------------------
        // OWNER CHECK
        // ------------------------------------

        const ownerId =
            listing.owner
                ? String(
                      listing.owner
                  )
                : null;

        const senderId =
            String(
                req.user._id
            );

        const receiverUserId =
            String(receiverId);

        console.log(
            "MESSAGE OWNER CHECK:",
            {
                ownerId,
                senderId,
                receiverUserId
            }
        );

        if (!ownerId) {
            return res.status(400).json({
                success: false,
                message:
                    "This listing has no valid owner."
            });
        }

        const senderIsOwner =
            senderId === ownerId;

        const receiverIsOwner =
            receiverUserId === ownerId;

        // ------------------------------------
        // CHECK EXISTING CONVERSATION
        // ------------------------------------

        const existingConversation =
            await Message.exists({
                listing: listingId,

                $or: [
                    {
                        sender:
                            req.user._id,

                        receiver:
                            receiverId
                    },

                    {
                        sender:
                            receiverId,

                        receiver:
                            req.user._id
                    }
                ]
            });

        /*
         * Buyer can start:
         *
         * Buyer -> Seller
         *
         * Seller can reply:
         *
         * Seller -> Buyer
         *
         * Random third users are blocked.
         */

        const allowed =
            receiverIsOwner ||
            (
                senderIsOwner &&
                existingConversation
            );

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this listing conversation."
            });
        }

        // ------------------------------------
        // CREATE MESSAGE
        // ------------------------------------

        const newMessage =
            await Message.create({
                listing:
                    listingId,

                sender:
                    req.user._id,

                receiver:
                    receiverId,

                message:
                    text
            });

        // Populate after creation
        const populatedMessage =
            await Message.findById(
                newMessage._id
            )
                .populate(
                    "sender",
                    "name email college"
                )
                .populate(
                    "receiver",
                    "name email college"
                )
                .populate(
                    "listing",
                    "title image mode condition value handoverLocation owner"
                );

        return res.status(201).json({
            success: true,
            message:
                "Message sent.",
            data:
                populatedMessage
        });

    } catch (error) {
        console.error(
            "SEND MESSAGE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while sending message.",
            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined
        });
    }
};


// ============================================
// GET MESSAGES
// GET /api/messages/:listingId/:userId
// ============================================

const getMessages = async (
    req,
    res
) => {
    try {
        const {
            listingId,
            userId
        } = req.params;

        console.log(
            "GET MESSAGES:",
            {
                listingId,
                userId,
                currentUser:
                    req.user?._id
            }
        );

        // Validate IDs
        if (
            !validId(listingId) ||
            !validId(userId)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid conversation details."
            });
        }

        // Prevent self chat
        if (
            sameId(
                req.user._id,
                userId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot chat with yourself."
            });
        }

        // IMPORTANT:
        // Do NOT populate owner here.
        // We need the original owner ID.
        const listing =
            await Listing.findById(
                listingId
            ).lean();

        if (!listing) {
            return res.status(404).json({
                success: false,
                message:
                    "Listing not found."
            });
        }

        const ownerId =
            listing.owner
                ? String(
                      listing.owner
                  )
                : null;

        const currentUserId =
            String(
                req.user._id
            );

        const otherUserId =
            String(userId);

        console.log(
            "GET CHAT OWNER:",
            ownerId
        );

        // ------------------------------------
        // CHECK EXISTING CONVERSATION
        // ------------------------------------

        const conversationExists =
            await Message.exists({
                listing: listingId,

                $or: [
                    {
                        sender:
                            req.user._id,

                        receiver:
                            userId
                    },

                    {
                        sender:
                            userId,

                        receiver:
                            req.user._id
                    }
                ]
            });

        // ------------------------------------
        // ACCESS CHECK
        // ------------------------------------

        const isOwner =
            ownerId ===
            currentUserId;

        const isChattingWithOwner =
            ownerId ===
            otherUserId;

        /*
         * Allowed:
         *
         * 1. Listing owner opens chat
         * 2. Buyer opens seller chat
         * 3. Existing conversation participants
         */

        if (
            !isOwner &&
            !isChattingWithOwner &&
            !conversationExists
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }

        // ------------------------------------
        // LOAD MESSAGES
        // ------------------------------------

        const messages =
            await Message.find({
                listing: listingId,

                $or: [
                    {
                        sender:
                            req.user._id,

                        receiver:
                            userId
                    },

                    {
                        sender:
                            userId,

                        receiver:
                            req.user._id
                    }
                ]
            })
                .populate(
                    "sender",
                    "name email college"
                )
                .populate(
                    "receiver",
                    "name email college"
                )
                .sort({
                    createdAt: 1
                });

        // ------------------------------------
        // MARK RECEIVED MESSAGES AS READ
        // ------------------------------------

        await Message.updateMany(
            {
                listing:
                    listingId,

                sender:
                    userId,

                receiver:
                    req.user._id,

                read: false
            },

            {
                $set: {
                    read: true
                }
            }
        );

        // ------------------------------------
        // GET LISTING OWNER DETAILS
        // ------------------------------------

        let owner = null;

        if (ownerId) {
            owner =
                await User.findById(
                    ownerId
                )
                    .select(
                        "name email college"
                    )
                    .lean();
        }

        return res.json({
            success: true,

            messages,

            listing: {
                ...listing,

                ownerId,

                owner
            }
        });

    } catch (error) {
        console.error(
            "GET MESSAGES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while loading messages.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined
        });
    }
};


// ============================================
// GET ALL CONVERSATIONS
// GET /api/messages/conversations
// ============================================

const getConversations = async (
    req,
    res
) => {
    try {
        const messages =
            await Message.find({
                $or: [
                    {
                        sender:
                            req.user._id
                    },

                    {
                        receiver:
                            req.user._id
                    }
                ]
            })
                .populate(
                    "sender",
                    "name email college"
                )
                .populate(
                    "receiver",
                    "name email college"
                )
                .populate(
                    "listing",
                    "title image mode condition value handoverLocation owner"
                )
                .sort({
                    createdAt: -1
                });

        const conversations = [];

        const seen =
            new Set();

        for (
            const message of messages
        ) {
            if (
                !message.listing
            ) {
                continue;
            }

            const sender = message.sender;
            const receiver = message.receiver;

            if (!sender || !receiver) {
                continue;
            }

            const otherUser =
                sameId(
                    sender._id,
                    req.user._id
                )
                    ? receiver
                    : sender;

            if (!otherUser) {
                continue;
            }

            const key =
                `${message.listing._id}-${otherUser._id}`;

            if (
                seen.has(key)
            ) {
                continue;
            }

            seen.add(key);

            const unreadCount =
                await Message.countDocuments(
                    {
                        listing:
                            message.listing._id,

                        sender:
                            otherUser._id,

                        receiver:
                            req.user._id,

                        read: false
                    }
                );

            conversations.push({
                key,

                listing:
                    message.listing,

                otherUser,

                lastMessage:
                    message.message,

                updatedAt:
                    message.createdAt,

                unreadCount
            });
        }

        return res.json({
            success: true,
            conversations
        });

    } catch (error) {
        console.error(
            "GET CONVERSATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while loading conversations."
        });
    }
};


module.exports = {
    sendMessage,
    getMessages,
    getConversations
};