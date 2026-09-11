const express = require("express");

const {
    getListings,
    createListing,
    getMyListings
} = require("../controllers/listingController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Anyone can browse the marketplace
router.get("/", getListings);

// Authentication required for creating/managing listings
router.post("/", protect, createListing);

router.get("/mine", protect, getMyListings);

module.exports = router;