const Listing = require("../models/Listing");
const User = require("../models/User");


// ============================================
// GET ALL LISTINGS
// ============================================

const getListings = async (req, res) => {
    try {
        // IMPORTANT:
        // First get the raw MongoDB documents.
        // Do NOT populate here because we need to
        // preserve the original owner ObjectId.
        const listings =
            await Listing.find({
                status: {
                    $ne: "reused"
                }
            })
                .sort({
                    createdAt: -1
                })
                .lean();

        // Collect all owner IDs
        const ownerIds = listings
            .map((item) => item.owner)
            .filter(Boolean);

        // Get the users separately
        const users =
            await User.find({
                _id: {
                    $in: ownerIds
                }
            })
                .select(
                    "name email college"
                )
                .lean();

        // Create quick lookup map
        const userMap = new Map();

        users.forEach((user) => {
            userMap.set(
                String(user._id),
                user
            );
        });

        // Attach owner information
        const formattedListings =
            listings.map((item) => {
                const ownerId =
                    item.owner
                        ? String(item.owner)
                        : null;

                const owner =
                    ownerId
                        ? userMap.get(
                              ownerId
                          ) || null
                        : null;

                return {
                    ...item,

                    ownerId,

                    owner,

                    chatAvailable: Boolean(owner)
                };
            });

        console.log(
            "LISTINGS OWNER DEBUG:"
        );

        formattedListings.forEach(
            (item) => {
                console.log({
                    title: item.title,
                    ownerId:
                        item.ownerId,
                    owner:
                        item.owner?.name ||
                        null
                });
            }
        );

        // A listing without a real User owner cannot support requests
        // or chat. Do not expose those stale/orphan records to the UI.
        const safeListings =
            formattedListings.filter(
                (item) => item.chatAvailable
            );

        res.json({
            success: true,
            listings: safeListings
        });

    } catch (error) {
        console.error(
            "Get listings error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch listings"
        });
    }
};


// ============================================
// CREATE LISTING
// ============================================

const createListing = async (
    req,
    res
) => {
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

        const listing =
            await Listing.create({
                owner: req.user._id,

                title:
                    title.trim(),

                category,

                condition,

                mode,

                value: Number(
                    value || 0
                ),

                description:
                    description.trim(),

                image:
                    image || "",

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

        res.status(201).json({
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
            "Create listing error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create listing"
        });
    }
};


// ============================================
// GET MY LISTINGS
// ============================================

const getMyListings = async (
    req,
    res
) => {
    try {
        const listings =
            await Listing.find({
                owner:
                    req.user._id
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

                ownerId:
                    item.owner
                        ? String(
                              item.owner
                          )
                        : null,

                owner: user,

                chatAvailable: Boolean(user)
            }));

        res.json({
            success: true,
            listings:
                formattedListings
        });

    } catch (error) {
        console.error(
            "My listings error:",
            error
        );

        res.status(500).json({
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