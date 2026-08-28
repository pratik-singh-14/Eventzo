// =====================================================
// EVENTZO BACKEND
// Events + Registration + Email Verification
// Login + JWT + /ME + Logout
// MongoDB Atlas + Gmail SMTP
// =====================================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

require("dotenv").config();

const app = express();


// =====================================================
// CONFIGURATION
// =====================================================

const PORT = process.env.PORT || 5000;

const MONGODB_URI = process.env.MONGODB_URI;

const JWT_SECRET = process.env.JWT_SECRET;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://127.0.0.1:5500/frontend";

const API_URL =
    process.env.API_URL ||
    `http://localhost:${PORT}`;


// =====================================================
// SECURITY CHECK
// =====================================================

if (!JWT_SECRET) {
    console.warn(
        "⚠️ WARNING: JWT_SECRET is not configured."
    );
}

if (!MONGODB_URI) {
    console.warn(
        "⚠️ WARNING: MONGODB_URI is not configured."
    );
}


// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5500/frontend",
    "http://127.0.0.1:5500/frontend",
    FRONTEND_URL
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow Postman, curl and server requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Allow localhost development ports
            if (
                origin.startsWith("http://localhost:")
            ) {
                return callback(null, true);
            }

            if (
                origin.startsWith("http://127.0.0.1:")
            ) {
                return callback(null, true);
            }

            return callback(
                new Error("CORS: Origin not allowed")
            );
        },

        credentials: true
    })
);


// =====================================================
// BODY PARSING
// =====================================================

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "EVENTZO backend is running 🚀",

        status:
            "online",

        backend:
            API_URL,

        api:
            `${API_URL}/api`,

        frontend:
            FRONTEND_URL

    });

});


// =====================================================
// API TEST
// =====================================================

app.get("/api/test", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "Eventzo API is working ✅"

    });

});


// =====================================================
// USER MODEL
// =====================================================

const userSchema = new mongoose.Schema(

    {

        name: {

            type: String,

            required: true,

            trim: true,

            minlength: 2,

            maxlength: 100

        },

        email: {

            type: String,

            required: true,

            unique: true,

            lowercase: true,

            trim: true,

            index: true

        },

        password: {

            type: String,

            required: true

        },

        emailVerified: {

            type: Boolean,

            default: false

        },

        verificationToken: {

            type: String,

            default: null

        },

        verificationTokenExpires: {

            type: Date,

            default: null

        }

    },

    {

        timestamps: true

    }

);


const User =
    mongoose.model(
        "User",
        userSchema
    );


// =====================================================
// EVENT MODEL
// =====================================================

const eventSchema = new mongoose.Schema(

    {

        title: {

            type: String,

            required: true,

            trim: true,

            maxlength: 200

        },

        description: {

            type: String,

            default: ""

        },

        category: {

            type: String,

            default: "Other",

            trim: true

        },

        date: {

            type: Date,

            required: true

        },

        time: {

            type: String,

            default: ""

        },

        location: {

            type: String,

            default: ""

        },

        price: {

            type: Number,

            default: 0,

            min: 0

        },

        totalSeats: {

            type: Number,

            default: 100,

            min: 0

        },

        availableSeats: {

            type: Number,

            default: 100,

            min: 0

        },

        image: {

            type: String,

            default: ""

        }

    },

    {

        timestamps: true

    }

);


const Event =
    mongoose.model(
        "Event",
        eventSchema
    );


// =====================================================
// GMAIL SMTP
// =====================================================

let transporter = null;


if (
    process.env.GMAIL_USER &&
    process.env.GMAIL_APP_PASSWORD
) {

    transporter =
        nodemailer.createTransport({

            service: "gmail",

            auth: {

                user:
                    process.env.GMAIL_USER,

                pass:
                    process.env.GMAIL_APP_PASSWORD

            }

        });


    transporter.verify(
        (error) => {

            if (error) {

                console.error(
                    "Gmail SMTP connection failed ❌"
                );

                console.error(
                    error.message
                );

            } else {

                console.log(
                    "Gmail SMTP connected successfully ✅"
                );

            }

        }
    );

} else {

    console.warn(
        "⚠️ Gmail credentials are not configured."
    );

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// SEND EMAIL
// =====================================================

async function sendEmail(
    to,
    subject,
    html,
    text
) {

    if (!transporter) {

        throw new Error(
            "Gmail SMTP is not configured"
        );

    }

    return transporter.sendMail({

        from:
            process.env.GMAIL_USER,

        to,

        subject,

        text,

        html

    });

}


// =====================================================
// CREATE JWT
// =====================================================

function createToken(user) {

    if (!JWT_SECRET) {

        throw new Error(
            "JWT_SECRET is not configured"
        );

    }

    return jwt.sign(

        {

            id:
                user._id.toString(),

            email:
                user.email

        },

        JWT_SECRET,

        {

            expiresIn: "7d"

        }

    );

}


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

function authenticateToken(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;


    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


    const token =
        authHeader.substring(7);


    if (!token) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication token missing"

        });

    }


    if (!JWT_SECRET) {

        return res.status(500).json({

            success: false,

            message:
                "JWT authentication is not configured"

        });

    }


    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        req.user =
            decoded;

        next();

    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired token"

        });

    }

}


// =====================================================
// AUTH - REGISTER
// =====================================================

app.post(
    "/api/auth/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, email and password are required"

                });

            }


            const cleanName =
                String(name).trim();


            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            if (cleanName.length < 2) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name must contain at least 2 characters"

                });

            }


            if (password.length < 6) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must be at least 6 characters"

                });

            }


            const existingUser =
                await User.findOne({
                    email: cleanEmail
                });


            // Existing verified user
            if (
                existingUser &&
                existingUser.emailVerified
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "An account with this email already exists"

                });

            }


            // Existing unverified user
            if (existingUser) {

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        12
                    );


                const verificationToken =
                    crypto
                        .randomBytes(32)
                        .toString("hex");


                existingUser.name =
                    cleanName;

                existingUser.password =
                    hashedPassword;

                existingUser.verificationToken =
                    verificationToken;

                existingUser.verificationTokenExpires =
                    new Date(
                        Date.now() +
                        30 * 60 * 1000
                    );


                await existingUser.save();


                await sendVerificationEmail(
                    existingUser,
                    verificationToken
                );


                return res.status(200).json({

                    success: true,

                    message:
                        "Verification email sent. Please check your email."

                });

            }


            // New user
            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );


            const verificationToken =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            const user =
                new User({

                    name:
                        cleanName,

                    email:
                        cleanEmail,

                    password:
                        hashedPassword,

                    emailVerified:
                        false,

                    verificationToken:
                        verificationToken,

                    verificationTokenExpires:
                        new Date(
                            Date.now() +
                            30 * 60 * 1000
                        )

                });


            await user.save();


            await sendVerificationEmail(
                user,
                verificationToken
            );


            return res.status(201).json({

                success: true,

                message:
                    "Registration successful. Please verify your email."

            });

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Registration failed",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// SEND VERIFICATION EMAIL
// =====================================================

async function sendVerificationEmail(
    user,
    token
) {

    const verificationUrl =
        `${FRONTEND_URL}/verify.html?token=${encodeURIComponent(token)}`;


    const text = `

Welcome to EVENTZO!

Hello ${user.name},

Please verify your EVENTZO account by opening this link:

${verificationUrl}

This verification link expires in 30 minutes.

If you did not create this account, you can ignore this email.

`;


    const html = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"
>

<title>
Verify EVENTZO Account
</title>

</head>

<body style="
margin:0;
padding:0;
background:#0b1220;
font-family:Arial,Helvetica,sans-serif;
">

<div style="
max-width:600px;
margin:40px auto;
background:#111827;
padding:35px;
border-radius:16px;
color:#ffffff;
">

<h1 style="
color:#00f5a0;
margin-top:0;
">
EVENTZO
</h1>

<h2>
Verify your email
</h2>

<p>
Hello ${escapeHTML(user.name)},
</p>

<p>
Thank you for registering with EVENTZO.
Please verify your email address using the button below.
</p>

<div style="
margin:30px 0;
">

<a
href="${verificationUrl}"
style="
display:inline-block;
padding:14px 24px;
background:#00f5a0;
color:#071018;
text-decoration:none;
border-radius:8px;
font-weight:bold;
"
>
Verify Email
</a>

</div>

<p>
This verification link expires in 30 minutes.
</p>

<p style="
color:#9ca3af;
font-size:13px;
">

If you did not create this account,
you can safely ignore this email.

</p>

</div>

</body>

</html>

`;


    await sendEmail(

        user.email,

        "Verify your EVENTZO account",

        html,

        text

    );

}


// =====================================================
// EMAIL VERIFICATION
// =====================================================

app.get(
    "/api/auth/verify-email",
    async (req, res) => {

        try {

            const token =
                req.query.token;


            if (!token) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Verification token is required"

                });

            }


            const user =
                await User.findOne({

                    verificationToken:
                        token,

                    verificationTokenExpires: {
                        $gt: new Date()
                    }

                });


            if (!user) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Verification link is invalid or expired"

                });

            }


            user.emailVerified =
                true;

            user.verificationToken =
                null;

            user.verificationTokenExpires =
                null;


            await user.save();


            return res.json({

                success: true,

                message:
                    "Email verified successfully 🎉"

            });

        } catch (error) {

            console.error(
                "Email verification error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Email verification failed"

            });

        }

    }
);


// =====================================================
// AUTH - LOGIN
// =====================================================

app.post(
    "/api/auth/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and password are required"

                });

            }


            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            const user =
                await User.findOne({

                    email:
                        cleanEmail

                });


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            const passwordCorrect =
                await bcrypt.compare(

                    password,

                    user.password

                );


            if (!passwordCorrect) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            if (!user.emailVerified) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Please verify your email before logging in."

                });

            }


            const token =
                createToken(user);


            return res.json({

                success: true,

                message:
                    "Login successful",

                token,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    emailVerified:
                        user.emailVerified

                }

            });

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Login failed",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// AUTH - CURRENT USER
// =====================================================

app.get(
    "/api/auth/me",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            return res.json({

                success: true,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    emailVerified:
                        user.emailVerified

                }

            });

        } catch (error) {

            console.error(
                "/me error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to get current user"

            });

        }

    }
);


// =====================================================
// AUTH - LOGOUT
// =====================================================

app.post(
    "/api/auth/logout",
    authenticateToken,
    (req, res) => {

        return res.json({

            success: true,

            message:
                "Logged out successfully"

        });

    }
);


// =====================================================
// EVENTS - GET ALL
// =====================================================

app.get(
    "/api/events",
    async (req, res) => {

        try {

            const events =
                await Event.find()
                    .sort({
                        date: 1
                    });


            return res.json({

                success: true,

                events

            });

        } catch (error) {

            console.error(
                "Get events error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load events"

            });

        }

    }
);


// =====================================================
// EVENTS - GET SINGLE
// =====================================================

app.get(
    "/api/events/:id",
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid event ID"

                });

            }


            const event =
                await Event.findById(
                    req.params.id
                );


            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found"

                });

            }


            return res.json({

                success: true,

                event

            });

        } catch (error) {

            console.error(
                "Get event error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load event"

            });

        }

    }
);


// =====================================================
// EVENTS - CREATE
// =====================================================

app.post(
    "/api/events",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                title,
                description,
                category,
                date,
                time,
                location,
                price,
                totalSeats,
                image
            } = req.body;


            if (
                !title ||
                !date
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Title and date are required"

                });

            }


            const seats =
                Number(totalSeats);


            if (
                !Number.isFinite(seats) ||
                seats < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Total seats must be a valid number"

                });

            }


            const event =
                new Event({

                    title:
                        String(title).trim(),

                    description:
                        description || "",

                    category:
                        category || "Other",

                    date,

                    time:
                        time || "",

                    location:
                        location || "",

                    price:
                        Math.max(
                            0,
                            Number(price) || 0
                        ),

                    totalSeats:
                        seats,

                    availableSeats:
                        seats,

                    image:
                        image || ""

                });


            await event.save();


            return res.status(201).json({

                success: true,

                message:
                    "Event created successfully",

                event

            });

        } catch (error) {

            console.error(
                "Create event error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to create event",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// EVENTS - DELETE
// =====================================================

app.delete(
    "/api/events/:id",
    authenticateToken,
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid event ID"

                });

            }


            const event =
                await Event.findByIdAndDelete(
                    req.params.id
                );


            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found"

                });

            }


            return res.json({

                success: true,

                message:
                    "Event deleted successfully"

            });

        } catch (error) {

            console.error(
                "Delete event error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to delete event"

            });

        }

    }
);


// =====================================================
// SEND EMAIL API
// =====================================================

app.post(
    "/api/send-email",
    async (req, res) => {

        try {

            const {
                to,
                subject,
                message
            } = req.body;


            if (
                !to ||
                !subject ||
                !message
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "to, subject and message are required"

                });

            }


            await sendEmail(

                to,

                subject,

                `<p>${escapeHTML(message)}</p>`,

                message

            );


            return res.json({

                success: true,

                message:
                    "Email sent successfully ✅"

            });

        } catch (error) {

            console.error(
                "Send email error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to send email",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// API INFORMATION
// =====================================================

app.get(
    "/api",
    (req, res) => {

        res.json({

            success: true,

            message:
                "EVENTZO API",

            backend:
                API_URL,

            frontend:
                FRONTEND_URL,

            endpoints: {

                test:
                    "GET /api/test",

                events:
                    "GET /api/events",

                singleEvent:
                    "GET /api/events/:id",

                createEvent:
                    "POST /api/events",

                deleteEvent:
                    "DELETE /api/events/:id",

                register:
                    "POST /api/auth/register",

                verifyEmail:
                    "GET /api/auth/verify-email",

                login:
                    "POST /api/auth/login",

                me:
                    "GET /api/auth/me",

                logout:
                    "POST /api/auth/logout",

                sendEmail:
                    "POST /api/send-email"

            }

        });

    }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API route not found",

            path:
                req.originalUrl

        });

    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Server error:",
            error
        );


        if (
            error.message &&
            error.message.startsWith("CORS:")
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "CORS origin not allowed"

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
);


// =====================================================
// MONGODB CONNECTION
// =====================================================

async function connectMongoDB() {

    if (!MONGODB_URI) {

        throw new Error(
            "MONGODB_URI is missing in .env"
        );

    }


    await mongoose.connect(
        MONGODB_URI
    );


    console.log(
        "MongoDB connected successfully ✅"
    );


    console.log(
        `Database: ${mongoose.connection.name}`
    );

}


// =====================================================
// START SERVER
// =====================================================

async function startServer() {

    try {

        await connectMongoDB();


        app.listen(

            PORT,

            "0.0.0.0",

            () => {

                console.log("");

                console.log(
                    "========================================"
                );

                console.log(
                    "🚀 EVENTZO BACKEND STARTED"
                );

                console.log(
                    "========================================"
                );

                console.log(
                    `Backend URL: ${API_URL}`
                );

                console.log(
                    `API URL: ${API_URL}/api`
                );

                console.log(
                    `Frontend URL: ${FRONTEND_URL}`
                );

                console.log(
                    "========================================"
                );

                console.log(
                    `GET ${API_URL}/`
                );

                console.log(
                    `GET ${API_URL}/api/test`
                );

                console.log(
                    `GET ${API_URL}/api/events`
                );

                console.log(
                    "========================================"
                );

            }

        );

    } catch (error) {

        console.error("");

        console.error(
            "❌ SERVER STARTUP FAILED"
        );

        console.error(
            error.message
        );

        process.exit(1);

    }

}


// =====================================================
// START
// =====================================================

startServer();