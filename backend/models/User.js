const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["asha_worker", "supervisor"],
            default: "asha_worker",
        },
        assignedAreaIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Area",
            },
        ],
        preferredLanguage: {
            type: String,
            enum: ["en", "hi"],
            default: "en",
        },
        totalPoints: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
