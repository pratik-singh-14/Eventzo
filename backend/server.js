const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// ===============================
// CONFIGURATION
// ===============================

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// BASIC ROUTES
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "EVENTZO backend is running 🚀"
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Eventzo API is working ✅"
    });
});

// ===============================
// GMAIL SMTP
// ===============================

let transporter = null;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    transporter.verify((error) => {
        if (error) {
            console.log("Gmail SMTP connection failed ❌");
            console.log(error.message);
        } else {
            console.log("Gmail SMTP connected successfully ✅");
        }
    });
} else {
    console.log("Gmail credentials not found in .env ⚠️");
}

// ===============================
// SEND EMAIL API
// ===============================

app.post("/api/send-email", async (req, res) => {
    try {
        const { to, subject, message } = req.body;

        if (!to || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "to, subject and message are required"
            });
        }

        if (!transporter) {
            return res.status(500).json({
                success: false,
                message: "Gmail SMTP is not configured"
            });
        }

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: to,
            subject: subject,
            text: message
        };

        const info = await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "Email sent successfully ✅",
            messageId: info.messageId
        });

    } catch (error) {
        console.error("Email error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send email",
            error: error.message
        });
    }
});

// ===============================
// MONGODB CONNECTION
// ===============================

async function connectMongoDB() {
    if (!MONGODB_URI) {
        console.log("MONGODB_URI is missing in .env ❌");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);

        console.log("MongoDB connected successfully ✅");
        console.log(`Database: ${mongoose.connection.name}`);

    } catch (error) {
        console.log("MongoDB connection failed ❌");
        console.log(error.message);

        process.exit(1);
    }
}

// ===============================
// START SERVER
// ===============================

async function startServer() {
    try {
        await connectMongoDB();

        app.listen(PORT, () => {
            console.log(`EVENTZO server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed ❌");
        console.error(error);
        process.exit(1);
    }
}

startServer();