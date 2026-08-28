
// =====================================================
// EVENTZO BACKEND SERVER
// =====================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();


// =====================================================
// IMPORT DATABASE
// =====================================================

const connectDB = require("./config/db");


// =====================================================
// IMPORT ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");


// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// =====================================================
// DATABASE CONNECTION
// =====================================================

connectDB();


// =====================================================
// AUTH ROUTES
// =====================================================

app.use("/api/auth", authRoutes);


// =====================================================
// EVENT ROUTES
// =====================================================

app.use("/api/events", eventRoutes);


// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to EVENTZO 🚀",
        status: "Server is running"
    });
});


// =====================================================
// API TEST ROUTE
// =====================================================

app.get("/api/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "EVENTZO API is working!"
    });
});


// =====================================================
// API HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "EVENTZO backend is healthy",
        database: "Connected through MongoDB"
    });
});


// =====================================================
// 404 ROUTE
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
        path: req.originalUrl
    });
});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
    console.error("Server error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});


// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `EVENTZO server running at http://localhost:${PORT}`
    );
});
