const Listing = require("../models/Listing");
const Request = require("../models/Request");

const WASTE_FACTORS = {
    books: 0.3,
    electronics: 2.1,
    lab: 1.5,
    hostel: 1.2,
    bags: 0.8,
    clothing: 0.5,
    stationery: 0.1
};

const getImpact = async (req, res) => {
    try {
        const reusedItems = await Listing.find({
            status: "reused"
        });

        const itemsReused = reusedItems.length;

        const wasteDiverted = reusedItems.reduce(
            (total, item) =>
                total +
                (WASTE_FACTORS[item.category] || 0),
            0
        );

        const valueCirculated = reusedItems.reduce(
            (total, item) =>
                total + Number(item.value || 0),
            0
        );

        const completedRequests =
            await Request.countDocuments({
                status: "completed"
            });

        const totalRequests =
            await Request.countDocuments({});

        const reuseSuccess =
            totalRequests === 0
                ? 0
                : Math.round(
                    (completedRequests /
                        totalRequests) *
                        100
                );

        res.json({
            success: true,
            impact: {
                itemsReused,
                wasteDiverted:
                    Number(wasteDiverted.toFixed(1)),
                valueCirculated,
                reuseSuccess
            }
        });
    } catch (error) {
        console.error("Impact error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate impact"
        });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Listing.aggregate([
            {
                $match: {
                    status: "reused"
                }
            },
            {
                $group: {
                    _id: "$owner",
                    itemsReused: {
                        $sum: 1
                    },
                    points: {
                        $sum: 25
                    }
                }
            },
            {
                $sort: {
                    points: -1
                }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    name: "$user.name",
                    itemsReused: 1,
                    points: 1
                }
            }
        ]);

        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error("Leaderboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch leaderboard"
        });
    }
};

module.exports = {
    getImpact,
    getLeaderboard
};