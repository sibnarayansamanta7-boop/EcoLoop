const express = require("express");

const {
    createRequest,
    getRequests,
    respondToRequest
} = require("../controllers/requestController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createRequest);

router.get("/", protect, getRequests);

router.patch(
    "/:requestId",
    protect,
    respondToRequest
);

module.exports = router;