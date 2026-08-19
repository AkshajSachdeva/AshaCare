const mongoose = require("mongoose");
const RewardTransaction = require("../models/RewardTransaction");

const getMyRewards = async (req, res) => {
    try {
        const { userId } = req.user;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        const rewardTransactions = await RewardTransaction.find({ workerId: userId })
            .select("points actionType description patientId caseId createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Rewards retrieved successfully",
            data: {
                rewardTransactions,
            },
        });
    } catch (error) {
        console.error("Failed to retrieve rewards:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve rewards",
        });
    }
};

module.exports = {
    getMyRewards,
};
