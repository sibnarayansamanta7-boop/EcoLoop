const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB =
    require("./config/db");

const authRoutes =
    require("./routes/authRoutes");

const listingRoutes =
    require("./routes/listingRoutes");

const requestRoutes =
    require("./routes/requestRoutes");

const messageRoutes =
    require("./routes/messageRoutes");

const statsRoutes =
    require("./routes/statsRoutes");


const app = express();


// ============================================
// DATABASE
// ============================================

connectDB();


// ============================================
// MIDDLEWARE
// ============================================

app.use(
    cors({
        origin: process.env.CLIENT_URL
    })
);
app.use(
    
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// ============================================
// TEST ROUTES
// ============================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message:
            "EcoLoop API is running"
    });
});


app.get(
    "/api/health",
    (req, res) => {
        res.json({
            success: true,
            status: "healthy"
        });
    }
);


// ============================================
// API ROUTES
// ============================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/listings",
    listingRoutes
);

app.use(
    "/api/requests",
    requestRoutes
);


// ⭐ THIS IS THE IMPORTANT ONE
app.use(
    "/api/messages",
    messageRoutes
);


// Statistics
app.use(
    "/api",
    statsRoutes
);


// ============================================
// 404 HANDLER
// ============================================

app.use(
    (req, res) => {
        console.log(
            "404 ROUTE:",
            req.method,
            req.originalUrl
        );

        res.status(404).json({
            success: false,
            message:
                `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
);


// ============================================
// ERROR HANDLER
// ============================================

app.use(
    (error, req, res, next) => {
        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Internal server error"
        });
    }
);


// ============================================
// START SERVER
// ============================================

const PORT =
    process.env.PORT || 5001;

app.listen(
    PORT,
    () => {
        console.log(
            "================================="
        );

        console.log(
            `EcoLoop server running on port ${PORT}`
        );

        console.log(
            "Message API: /api/messages"
        );

        console.log(
            "================================="
        );
    }
);