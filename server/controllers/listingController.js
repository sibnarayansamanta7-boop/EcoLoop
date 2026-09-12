const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const User = require("../models/User");

// ============================================
// GET ALL LISTINGS
// ============================================

const getListings = async (req, res) => {
    try {
        const listings = await Listing.find({
            status: { $ne: "reused" }
        })
            .sort({ createdAt: -1 })
            .lean();

        // Only keep owner IDs that are valid MongoDB ObjectIds.
        const validOwnerIds = listings
            .map((item) => item.owner)
            .filter((ownerId) =>
                ownerId &&
                mongoose.isValidObjectId(ownerId)
            )
            .map((ownerId) =>
                new mongoose.Types.ObjectId(ownerId)
            );

        // Remove duplicate owner IDs.
        const uniqueOwnerIds = [
            ...new Map(
                validOwnerIds.map((id) => [
                    String(id),
                    id
                ])
            ).values()
        ];

        let users = [];

        if (uniqueOwnerIds.length > 0) {
            users = await User.find({
                _id: {
                    $in: uniqueOwnerIds
                }
            })
                .select("name email college")
                .lean();
        }

        const userMap = new Map();

        users.forEach((user) => {
            userMap.set(
                String(user._id),
                user
            );
        });

        const safeListings = listings
            .map((item) => {
                const ownerId =
                    item.owner &&
                    mongoose.isValidObjectId(item.owner)
                        ? String(item.owner)
                        : null;

                const owner = ownerId
                    ? userMap.get(ownerId) || null
                    : null;

                return {
                    ...item,
                    ownerId,
                    owner,
                    chatAvailable: Boolean(owner)
                };
            })
            .filter(
                (item) =>
                    item.ownerId &&
                    item.owner
            );

        console.log(
            "LISTINGS OWNER DEBUG:"
        );

        safeListings.forEach((item) => {
            console.log({
                title: item.title,
                ownerId: item.ownerId,
                owner: item.owner?.name || null
            });
        });

        return res.status(200).json({
            success: true,
            listings: safeListings
        });
    } catch (error) {
        console.error(
            "GET LISTINGS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch listings"
        });
    }
};


// ============================================
// CREATE LISTING
// ============================================

const createListing = async (req, res) => {
    try {
        const {
            title,
            category,
            condition,
            mode,
            value,
            description,
            image,
            handoverLocation
        } = req.body;

        if (
            !title ||
            !category ||
            !condition ||
            !mode ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please fill all required fields"
            });
        }

        if (
            mode === "sell" &&
            Number(value) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Selling price must be greater than 0"
            });
        }

        if (
            !req.user ||
            !req.user._id
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required"
            });
        }

        const listing = await Listing.create({
            owner: req.user._id,

            title: title.trim(),

            category,

            condition,

            mode,

            value: Number(value || 0),

            description: description.trim(),

            image: image || "",

            handoverLocation:
                handoverLocation?.trim() ||
                "Main Gate"
        });

        const populatedListing =
            await Listing.findById(
                listing._id
            )
                .populate(
                    "owner",
                    "name email college"
                )
                .lean();

        return res.status(201).json({
            success: true,

            message:
                "Listing created successfully",

            listing: {
                ...populatedListing,

                ownerId:
                    populatedListing?.owner?._id ||
                    listing.owner
            }
        });
    } catch (error) {
        console.error(
            "CREATE LISTING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create listing"
        });
    }
};


// ============================================
// GET MY LISTINGS
// ============================================

const getMyListings = async (req, res) => {
    try {
        if (
            !req.user ||
            !req.user._id
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required"
            });
        }

        const listings =
            await Listing.find({
                owner: req.user._id
            })
                .sort({
                    createdAt: -1
                })
                .lean();

        const user =
            await User.findById(
                req.user._id
            )
                .select(
                    "name email college"
                )
                .lean();

        const formattedListings =
            listings.map((item) => ({
                ...item,

                ownerId: item.owner
                    ? String(item.owner)
                    : null,

                owner: user,

                chatAvailable:
                    Boolean(user)
            }));

        return res.status(200).json({
            success: true,
            listings:
                formattedListings
        });
    } catch (error) {
        console.error(
            "MY LISTINGS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch your listings"
        });
    }
};


module.exports = {
    getListings,
    createListing,
    getMyListings
};