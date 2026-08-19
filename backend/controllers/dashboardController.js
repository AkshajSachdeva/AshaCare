const Area = require("../models/Area");
const Patient = require("../models/Patient");
const User = require("../models/User");

const areaFields = "areaName areaType districtName stateName";
const patientFields =
    "fullName age gender phoneNumber areaId healthCategories visitStatus lastVisitDate nextVisitDate currentCaseId updatedAt";

const getWorkerDashboard = async (req, res) => {
    try {
        const { userId } = req.user;
        const worker = await User.findById(userId).select("fullName totalPoints");

        if (!worker) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        const patientQuery = { assignedWorkerId: userId };
        const [
            totalPatients,
            visitsDue,
            screeningCompleted,
            referralsPending,
            appointmentsScheduled,
            followUpsDue,
            verificationPending,
            areas,
            recentPatients,
        ] = await Promise.all([
            Patient.countDocuments(patientQuery),
            Patient.countDocuments({ ...patientQuery, visitStatus: "visit_due" }),
            Patient.countDocuments({
                ...patientQuery,
                visitStatus: "screening_completed",
            }),
            Patient.countDocuments({
                ...patientQuery,
                visitStatus: "referral_pending",
            }),
            Patient.countDocuments({
                ...patientQuery,
                visitStatus: "appointment_scheduled",
            }),
            Patient.countDocuments({
                ...patientQuery,
                visitStatus: "follow_up_due",
            }),
            Patient.countDocuments({
                ...patientQuery,
                visitStatus: "verification_pending",
            }),
            Area.find({ assignedWorkerIds: userId })
                .select(areaFields)
                .sort({ areaName: 1 }),
            Patient.find(patientQuery)
                .select(patientFields)
                .sort({ updatedAt: -1 })
                .limit(5),
        ]);

        return res.status(200).json({
            success: true,
            message: "Worker dashboard retrieved successfully",
            data: {
                worker: {
                    userId: worker._id.toString(),
                    fullName: worker.fullName,
                    totalPoints: worker.totalPoints,
                },
                summary: {
                    totalPatients,
                    visitsDue,
                    screeningCompleted,
                    referralsPending,
                    appointmentsScheduled,
                    followUpsDue,
                    verificationPending,
                },
                areas,
                recentPatients,
            },
        });
    } catch (error) {
        console.error("Failed to retrieve worker dashboard:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve worker dashboard",
        });
    }
};

module.exports = {
    getWorkerDashboard,
};
