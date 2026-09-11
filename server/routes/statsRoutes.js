const express = require("express");

const {
    getImpact,
    getLeaderboard
} = require("../controllers/statsController");

const router = express.Router();

router.get("/impact", getImpact);

router.get("/leaderboard", getLeaderboard);

module.exports = router;