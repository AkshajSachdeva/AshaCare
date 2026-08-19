const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const authenticationError = (res) =>
    res.status(401).json({
        success: false,
        message: "Invalid phone number or password",
    });

const safeUser = (user) => ({
    userId: user._id.toString(),
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: user.role,
    assignedAreaIds: user.assignedAreaIds.map((areaId) => areaId.toString()),
    preferredLanguage: user.preferredLanguage,
    totalPoints: user.totalPoints,
});

const getJwtConfig = () => {
    const { JWT_SECRET: jwtSecret, JWT_EXPIRES_IN: jwtExpiresIn } = process.env;

    if (!jwtSecret || !jwtExpiresIn) {
        return null;
    }

    return { jwtSecret, jwtExpiresIn };
};

const login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        if (
            typeof phoneNumber !== "string" ||
            !phoneNumber.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return authenticationError(res);
        }

        const user = await User.findOne({ phoneNumber: phoneNumber.trim() });

        if (!user) {
            return authenticationError(res);
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatches) {
            return authenticationError(res);
        }

        const jwtConfig = getJwtConfig();

        if (!jwtConfig) {
            return res.status(500).json({
                success: false,
                message: "Authentication service is unavailable",
            });
        }

        const authToken = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role,
            },
            jwtConfig.jwtSecret,
            { expiresIn: jwtConfig.jwtExpiresIn }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                authToken,
                user: safeUser(user),
            },
        });
    } catch (error) {
        console.error("Failed to log in:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to log in",
        });
    }
};

const getAuthenticatedUser = async (req, res) => {
    try {
        const { userId } = req.user;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Authenticated user",
            data: {
                user: safeUser(user),
            },
        });
    } catch (error) {
        console.error("Failed to fetch authenticated user:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch authenticated user",
        });
    }
};

module.exports = {
    login,
    getAuthenticatedUser,
};
