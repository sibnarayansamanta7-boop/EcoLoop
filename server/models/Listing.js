const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "books",
                "electronics",
                "lab",
                "hostel",
                "bags",
                "clothing",
                "stationery"
            ]
        },

        condition: {
            type: String,
            required: true,
            enum: [
                "Excellent",
                "Good",
                "Fair"
            ]
        },

        mode: {
            type: String,
            required: true,
            enum: [
                "sell",
                "exchange",
                "donate"
            ]
        },

        value: {
            type: Number,
            default: 0
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            default: ""
        },

        handoverLocation: {
            type: String,
            default: "Main Gate",
            trim: true
        },

        status: {
            type: String,
            enum: [
                "available",
                "requested",
                "reused"
            ],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Listing",
        listingSchema
    );