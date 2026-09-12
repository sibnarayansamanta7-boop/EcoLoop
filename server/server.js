const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const requestRoutes = require("./routes/requestRoutes");
const messageRoutes = require("./routes/messageRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();

// ============================================
// DATABASE
// ============================================

connectDB();

// ============================================
// CORS
// ============================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no Origin header
            // such as curl / server-to-server requests.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(
                    `CORS blocked for origin: ${origin}`
                )
            );
        },
        credentials: true
    })
);

// ============================================
// BODY PARSING
// ============================================

// Images are currently converted to Base64 on the
// frontend, so the JSON request can be much larger
// than Express's default body limit.

app.use(
    express.json({
        limit: "12mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "12mb"
    })
);

// ============================================
// REQUEST LOGGER
// ============================================

app.use((req, res, next) => {
    console.log(
        `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
    );

    next();
});

// ============================================
// TEST ROUTES
// ============================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "EcoLoop API is running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy"
    });
});

// ============================================
// API ROUTES
// ============================================

app.use("/api/auth", authRoutes);

app.use("/api/listings", listingRoutes);

app.use("/api/requests", requestRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api", statsRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
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
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((error, req, res, next) => {
    console.error(
        "SERVER ERROR:",
        error
    );

    // Payload too large
    if (
        error.type === "entity.too.large" ||
        error.status === 413
    ) {
        return res.status(413).json({
            success: false,
            message:
                "Image or request data is too large. Please choose a smaller image."
        });
    }

    // CORS error
    if (
        error.message &&
        error.message.startsWith("CORS blocked")
    ) {
        return res.status(403).json({
            success: false,
            message: error.message
        });
    }

    const statusCode =
        error.statusCode ||
        error.status ||
        500;

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? "Internal server error"
                : error.message ||
                  "Request failed"
    });
});

// ============================================
// START SERVER
// ============================================

const PORT =
    process.env.PORT || 5001;

app.listen(PORT, () => {
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
        "Allowed origins:",
        allowedOrigins
    );

    console.log(
        "================================="
    );
});