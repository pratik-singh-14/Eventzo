
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // ==============================
        // USER NAME
        // ==============================
        name: {
            type: String,
            required: true,
            trim: true
        },

        // ==============================
        // USER EMAIL
        // ==============================
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // ==============================
        // PASSWORD
        // ==============================
        password: {
            type: String,
            required: true
        },

        // ==============================
        // EMAIL VERIFICATION
        // ==============================
        isVerified: {
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


// =====================================================
// EXPORT USER MODEL
// =====================================================

module.exports =
    mongoose.model("User", userSchema);
