const Area = require("../models/Area");
const User = require("../models/User");

const areaFields = "areaName areaType districtName stateName";

const getMyAreas = async (req, res) => {
    try {
        const { userId, role } = req.user;
        let areaQuery;

        if (role === "asha_worker") {
            areaQuery = { assignedWorkerIds: userId };
        } else if (role === "supervisor") {
            const supervisor = await User.findById(userId).select(
                "assignedAreaIds"
            );

            if (!supervisor) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authentication token",
                });
            }

            areaQuery = { _id: { $in: supervisor.assignedAreaIds } };
        } else {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
            });
        }

        const areas = await Area.find(areaQuery)
            .select(areaFields)
            .sort({ areaName: 1 });

        return res.status(200).json({
            success: true,
            message: "Areas retrieved successfully",
            data: {
                areas,
            },
        });
    } catch (error) {
        console.error("Failed to retrieve areas:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve areas",
        });
    }
};

module.exports = {
    getMyAreas,
};
