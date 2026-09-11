const Request = require("../models/Request");
const Listing = require("../models/Listing");

const createRequest = async (
    req,
    res
) => {
    try {
        const {
            listingId
        } = req.body;

        if (!listingId) {
            return res.status(400).json({
                success: false,
                message:
                    "Listing ID is required"
            });
        }

        const listing =
            await Listing.findById(
                listingId
            );

        if (!listing) {
            return res.status(404).json({
                success: false,
                message:
                    "Listing not found"
            });
        }

        if (
            listing.owner.toString() ===
            req.user._id.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot request your own item"
            });
        }

        if (
            listing.status !== "available"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This item is no longer available"
            });
        }

        const existingRequest =
            await Request.findOne({
                listing: listingId,
                requester:
                    req.user._id,
                status: {
                    $in: [
                        "pending",
                        "accepted"
                    ]
                }
            });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message:
                    "You already have an active request"
            });
        }

        const request =
            await Request.create({
                listing:
                    listing._id,
                owner:
                    listing.owner,
                requester:
                    req.user._id,
                status: "pending"
            });

        listing.status =
            "requested";

        await listing.save();

        await request.populate([
            {
                path: "listing"
            },
            {
                path: "owner",
                select:
                    "name email college"
            },
            {
                path: "requester",
                select:
                    "name email college"
            }
        ]);

        res.status(201).json({
            success: true,
            message:
                "Request sent successfully",
            request
        });
    } catch (error) {
        console.error(
            "Create request error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to send request"
        });
    }
};

const getRequests = async (
    req,
    res
) => {
    try {
        const incoming =
            await Request.find({
                owner: req.user._id
            })
                .populate("listing")
                .populate(
                    "requester",
                    "name email college"
                )
                .sort({
                    createdAt: -1
                });

        const outgoing =
            await Request.find({
                requester:
                    req.user._id
            })
                .populate("listing")
                .populate(
                    "owner",
                    "name email college"
                )
                .sort({
                    createdAt: -1
                });

        res.json({
            success: true,
            incoming,
            outgoing
        });
    } catch (error) {
        console.error(
            "Get requests error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch requests"
        });
    }
};

const respondToRequest = async (
    req,
    res
) => {
    try {
        const {
            requestId
        } = req.params;

        const {
            action
        } = req.body;

        if (
            ![
                "accepted",
                "declined",
                "completed"
            ].includes(action)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid action"
            });
        }

        const request =
            await Request.findById(
                requestId
            );

        if (!request) {
            return res.status(404).json({
                success: false,
                message:
                    "Request not found"
            });
        }

        const userId =
            req.user._id.toString();

        const isOwner =
            request.owner.toString() ===
            userId;

        const isRequester =
            request.requester.toString() ===
            userId;

        if (
            [
                "accepted",
                "declined"
            ].includes(action) &&
            !isOwner
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the owner can respond"
            });
        }

        if (
            action === "completed" &&
            !isOwner &&
            !isRequester
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to complete this handover"
            });
        }

        if (
            action === "accepted"
        ) {
            if (
                request.status !==
                "pending"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Request is no longer pending"
                });
            }

            request.status =
                "accepted";

            await request.save();

            return res.json({
                success: true,
                message:
                    "Request accepted. Contact the student and complete the handover."
            });
        }

        if (
            action === "declined"
        ) {
            if (
                request.status !==
                "pending"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Request is no longer pending"
                });
            }

            request.status =
                "declined";

            await request.save();

            const listing =
                await Listing.findById(
                    request.listing
                );

            if (listing) {
                listing.status =
                    "available";

                await listing.save();
            }

            return res.json({
                success: true,
                message:
                    "Request declined"
            });
        }

        if (
            action === "completed"
        ) {
            if (
                request.status !==
                "accepted"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Request must be accepted before handover"
                });
            }

            request.status =
                "completed";

            await request.save();

            const listing =
                await Listing.findById(
                    request.listing
                );

            if (listing) {
                listing.status =
                    "reused";

                await listing.save();
            }

            return res.json({
                success: true,
                message:
                    "Handover completed. Item marked as reused."
            });
        }
    } catch (error) {
        console.error(
            "Respond request error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to process request"
        });
    }
};

module.exports = {
    createRequest,
    getRequests,
    respondToRequest
};