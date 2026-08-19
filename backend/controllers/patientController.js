const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const User = require("../models/User");

const patientFields =
    "fullName age gender phoneNumber address areaId assignedWorkerId healthCategories visitStatus lastVisitDate nextVisitDate currentCaseId schemeEnrollments createdAt updatedAt";

const accessDeniedResponse = (res) =>
    res.status(403).json({
        success: false,
        message: "You do not have permission to access this patient",
    });

const getSupervisorAreaIds = async (userId) => {
    const supervisor = await User.findById(userId).select("assignedAreaIds");
    return supervisor ? supervisor.assignedAreaIds : null;
};

const getPatients = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { areaId, visitStatus, search } = req.query;
        const patientQuery = {};

        if (role === "asha_worker") {
            patientQuery.assignedWorkerId = userId;
        } else if (role === "supervisor") {
            const assignedAreaIds = await getSupervisorAreaIds(userId);

            if (!assignedAreaIds) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authentication token",
                });
            }

            patientQuery.areaId = { $in: assignedAreaIds };
        } else {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
            });
        }

        if (areaId) {
            if (typeof areaId !== "string" || !mongoose.isValidObjectId(areaId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid area ID",
                });
            }

            patientQuery.areaId = areaId;

            if (role === "supervisor") {
                const assignedAreaIds = await getSupervisorAreaIds(userId);

                if (!assignedAreaIds.some((assignedAreaId) => assignedAreaId.equals(areaId))) {
                    return res.status(403).json({
                        success: false,
                        message: "You do not have permission to access this area",
                    });
                }
            }
        }

        if (visitStatus && typeof visitStatus === "string") {
            patientQuery.visitStatus = visitStatus;
        }

        if (search && typeof search === "string" && search.trim()) {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchPattern = new RegExp(escapedSearch, "i");

            patientQuery.$or = [
                { fullName: searchPattern },
                { phoneNumber: searchPattern },
            ];
        }

        const patients = await Patient.find(patientQuery)
            .select(patientFields)
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Patients retrieved successfully",
            data: {
                patients,
            },
        });
    } catch (error) {
        console.error("Failed to retrieve patients:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve patients",
        });
    }
};

const getPatientById = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }

        const patient = await Patient.findById(patientId).select(patientFields);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        if (req.user.role === "asha_worker") {
            if (!patient.assignedWorkerId.equals(req.user.userId)) {
                return accessDeniedResponse(res);
            }
        } else if (req.user.role === "supervisor") {
            const assignedAreaIds = await getSupervisorAreaIds(req.user.userId);

            if (
                !assignedAreaIds ||
                !assignedAreaIds.some((areaId) => areaId.equals(patient.areaId))
            ) {
                return accessDeniedResponse(res);
            }
        } else {
            return accessDeniedResponse(res);
        }

        return res.status(200).json({
            success: true,
            message: "Patient fetched successfully",
            data: {
                patient: patient,
            },
        });
    } catch (error) {
        console.error("Failed to fetch patient:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch patient",
        });
    }
};

module.exports = {
    getPatients,
    getPatientById,
};
