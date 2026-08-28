
// =====================================================
// EVENTZO - AUTH ROUTES
// REGISTER + EMAIL VERIFICATION + LOGIN + JWT + /ME
// =====================================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");

const router = express.Router();


// =====================================================
// GMAIL CONFIGURATION
// =====================================================

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});


// =====================================================
// CHECK GMAIL SMTP
// =====================================================

transporter.verify((error) => {

    if (error) {
        console.error(
            "Gmail SMTP connection failed:",
            error.message
        );
    } else {
        console.log(
            "Gmail SMTP connected successfully ✅"
        );
    }

});


// =====================================================
// REGISTER USER
// =====================================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // -----------------------------
        // REQUIRED FIELDS
        // -----------------------------

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });

        }


        // -----------------------------
        // PASSWORD LENGTH
        // -----------------------------

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters"
            });

        }


        const cleanEmail =
            email.toLowerCase().trim();


        const cleanName =
            name.trim();


        // -----------------------------
        // CHECK EXISTING USER
        // -----------------------------

        const existingUser =
            await User.findOne({
                email: cleanEmail
            });


        if (existingUser) {

            if (existingUser.isVerified) {

                return res.status(409).json({
                    success: false,
                    message:
                        "User already exists"
                });

            }


            // Existing account is not verified.
            // Create a new verification token.

            const verificationToken =
                crypto.randomBytes(32).toString("hex");


            existingUser.verificationToken =
                verificationToken;


            existingUser.verificationTokenExpires =
                new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                );


            await existingUser.save();


            const verificationLink =
                `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;


            try {

                await transporter.sendMail({

                    from:
                        `"EVENTZO" <${process.env.GMAIL_USER}>`,

                    to: cleanEmail,

                    subject:
                        "Verify your EVENTZO account 🎉",

                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: auto;
                            padding: 30px;
                            background: #070b14;
                            color: white;
                            border-radius: 15px;
                        ">

                            <h1 style="
                                color: #00f5a0;
                            ">
                                Welcome to EVENTZO 🎉
                            </h1>

                            <p>
                                Hi ${cleanName},
                            </p>

                            <p>
                                Please verify your email
                                address to activate your
                                EVENTZO account.
                            </p>

                            <a
                                href="${verificationLink}"
                                style="
                                    display:inline-block;
                                    padding:14px 22px;
                                    background:#00f5a0;
                                    color:#06120d;
                                    text-decoration:none;
                                    border-radius:8px;
                                    font-weight:bold;
                                "
                            >
                                Verify Email
                            </a>

                            <p style="
                                margin-top:25px;
                                color:#999;
                            ">
                                This verification link
                                expires in 24 hours.
                            </p>

                        </div>
                    `

                });


                console.log(
                    `Verification email resent to ${cleanEmail} ✅`
                );


                return res.status(200).json({

                    success: true,

                    message:
                        "Verification email sent again. Please check your email."

                });


            } catch (mailError) {

                console.error(
                    "Verification email error:",
                    mailError
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Account exists but verification email could not be sent."

                });

            }

        }


        // -----------------------------
        // CREATE PASSWORD HASH
        // -----------------------------

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // -----------------------------
        // CREATE VERIFICATION TOKEN
        // -----------------------------

        const verificationToken =
            crypto.randomBytes(32).toString("hex");


        const verificationTokenExpires =
            new Date(
                Date.now() + 24 * 60 * 60 * 1000
            );


        // -----------------------------
        // CREATE USER
        // -----------------------------

        const user =
            await User.create({

                name: cleanName,

                email: cleanEmail,

                password: hashedPassword,

                isVerified: false,

                verificationToken:
                    verificationToken,

                verificationTokenExpires:
                    verificationTokenExpires

            });


        // -----------------------------
        // VERIFICATION LINK
        // -----------------------------

        const verificationLink =
            `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;


        // -----------------------------
        // SEND VERIFICATION EMAIL
        // -----------------------------

        try {

            await transporter.sendMail({

                from:
                    `"EVENTZO" <${process.env.GMAIL_USER}>`,

                to: cleanEmail,

                subject:
                    "Verify your EVENTZO account 🎉",

                html: `

                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                        background: #070b14;
                        color: white;
                        border-radius: 15px;
                    ">

                        <h1 style="
                            color: #00f5a0;
                        ">
                            Welcome to EVENTZO 🎉
                        </h1>

                        <p>
                            Hi ${cleanName},
                        </p>

                        <p>
                            Your EVENTZO account has
                            been created successfully.
                        </p>

                        <p>
                            Before you can login,
                            please verify your email
                            address.
                        </p>

                        <div style="
                            margin:30px 0;
                        ">

                            <a
                                href="${verificationLink}"
                                style="
                                    display:inline-block;
                                    padding:14px 22px;
                                    background:#00f5a0;
                                    color:#06120d;
                                    text-decoration:none;
                                    border-radius:8px;
                                    font-weight:bold;
                                "
                            >
                                Verify My Email
                            </a>

                        </div>

                        <p style="
                            color:#999;
                            font-size:13px;
                        ">
                            This verification link
                            expires in 24 hours.
                        </p>

                        <p style="
                            color:#777;
                            font-size:12px;
                        ">
                            If you did not create this
                            account, you can safely
                            ignore this email.
                        </p>

                    </div>

                `

            });


            console.log(
                `Verification email sent to ${cleanEmail} ✅`
            );


        } catch (mailError) {

            console.error(
                "Verification email error:",
                mailError
            );


            // Remove user if email failed
            await User.deleteOne({
                _id: user._id
            });


            return res.status(500).json({

                success: false,

                message:
                    "Registration failed because verification email could not be sent."

            });

        }


        // -----------------------------
        // RESPONSE
        // -----------------------------

        return res.status(201).json({

            success: true,

            message:
                "Registration successful! Please check your email to verify your account.",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                isVerified:
                    user.isVerified

            }

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        // MongoDB duplicate email protection
        if (error.code === 11000) {

            return res.status(409).json({

                success: false,

                message:
                    "User already exists"

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });

    }

});


// =====================================================
// VERIFY EMAIL
// =====================================================

router.get(
    "/verify-email/:token",
    async (req, res) => {

        try {

            const token =
                req.params.token;


            // -----------------------------
            // FIND USER
            // -----------------------------

            const user =
                await User.findOne({

                    verificationToken:
                        token,

                    verificationTokenExpires:
                        {
                            $gt: new Date()
                        }

                });


            // -----------------------------
            // INVALID / EXPIRED TOKEN
            // -----------------------------

            if (!user) {

                return res.status(400).send(`

                    <!DOCTYPE html>

                    <html>

                    <head>

                        <title>
                            EVENTZO Verification
                        </title>

                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1.0"
                        >

                    </head>

                    <body style="
                        margin:0;
                        background:#070b14;
                        color:white;
                        font-family:Arial,sans-serif;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        min-height:100vh;
                        text-align:center;
                    ">

                        <div>

                            <div style="
                                font-size:60px;
                            ">
                                ❌
                            </div>

                            <h1>
                                Invalid or Expired Link
                            </h1>

                            <p style="
                                color:#999;
                            ">
                                This verification link
                                is no longer valid.
                            </p>

                        </div>

                    </body>

                    </html>

                `);

            }


            // -----------------------------
            // VERIFY ACCOUNT
            // -----------------------------

            user.isVerified = true;

            user.verificationToken = null;

            user.verificationTokenExpires = null;


            await user.save();


            console.log(
                `Email verified: ${user.email} ✅`
            );


            // -----------------------------
            // SUCCESS PAGE
            // -----------------------------

            return res.status(200).send(`

                <!DOCTYPE html>

                <html>

                <head>

                    <title>
                        EVENTZO - Email Verified
                    </title>

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                </head>

                <body style="
                    margin:0;
                    background:#070b14;
                    color:white;
                    font-family:Arial,sans-serif;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    min-height:100vh;
                    text-align:center;
                ">

                    <div>

                        <div style="
                            font-size:70px;
                        ">
                            🎉
                        </div>

                        <h1 style="
                            color:#00f5a0;
                        ">
                            Email Verified!
                        </h1>

                        <p style="
                            color:#aaa;
                            font-size:16px;
                        ">
                            Your EVENTZO account is now
                            verified.
                        </p>

                        <p style="
                            color:#aaa;
                        ">
                            You can now return to EVENTZO
                            and login.
                        </p>

                    </div>

                </body>

                </html>

            `);


        } catch (error) {

            console.error(
                "Email verification error:",
                error
            );


            return res.status(500).send(
                "Server error while verifying email."
            );

        }

    }
);


// =====================================================
// LOGIN USER
// =====================================================

router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            // -----------------------------
            // REQUIRED FIELDS
            // -----------------------------

            if (!email || !password) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and password are required"

                });

            }


            const cleanEmail =
                email.toLowerCase().trim();


            // -----------------------------
            // FIND USER
            // -----------------------------

            const user =
                await User.findOne({
                    email: cleanEmail
                });


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            // -----------------------------
            // CHECK EMAIL VERIFICATION
            // -----------------------------

            if (!user.isVerified) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Please verify your email before logging in."

                });

            }


            // -----------------------------
            // CHECK PASSWORD
            // -----------------------------

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            // -----------------------------
            // CREATE JWT
            // -----------------------------

            const token =
                jwt.sign(

                    {
                        userId: user._id.toString(),
                        email: user.email
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "7d"
                    }

                );


            // -----------------------------
            // SEND LOGIN EMAIL
            // -----------------------------

            try {

                await transporter.sendMail({

                    from:
                        `"EVENTZO" <${process.env.GMAIL_USER}>`,

                    to: user.email,

                    subject:
                        "EVENTZO Login Notification 🔐",

                    html: `

                        <div style="
                            font-family:Arial,sans-serif;
                            max-width:600px;
                            margin:auto;
                            padding:30px;
                            background:#070b14;
                            color:white;
                            border-radius:15px;
                        ">

                            <h2 style="
                                color:#00f5a0;
                            ">
                                EVENTZO Login Successful
                            </h2>

                            <p>
                                Hi ${user.name},
                            </p>

                            <p>
                                You have successfully
                                logged into your EVENTZO
                                account.
                            </p>

                            <p style="
                                color:#999;
                            ">
                                If you did not perform this
                                login, please secure your
                                account.
                            </p>

                        </div>

                    `

                });


                console.log(
                    `Login email sent to ${user.email} ✅`
                );


            } catch (mailError) {

                console.error(
                    "Login email error:",
                    mailError.message
                );

            }


            // -----------------------------
            // LOGIN RESPONSE
            // -----------------------------

            return res.status(200).json({

                success: true,

                message:
                    "Login successful!",

                token: token,

                user: {

                    id: user._id,

                    name: user.name,

                    email: user.email

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
                    "Server error"

            });

        }

    }
);


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
                "Access token required"

        });

    }


    const token =
        authHeader.split(" ")[1];


    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
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
// GET CURRENT USER
// =====================================================

router.get(
    "/me",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                ).select("-password");


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            return res.status(200).json({

                success: true,

                user: user

            });


        } catch (error) {

            console.error(
                "Get user error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
