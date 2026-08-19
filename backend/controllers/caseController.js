const mongoose = require("mongoose");
const CareCase = require("../models/CareCase");
const Patient = require("../models/Patient");
const calculateRisk = require("../utils/calculateRisk");

const allowedCaseTypes = [
    "pregnancy",
    "blood_pressure",
    "diabetes",
    "tuberculosis",
];

const invalidObjectIdResponse = (res, objectName) =>
    res.status(400).json({
        success: false,
        message: `Invalid ${objectName} ID`,
    });

const createCareCase = async (req, res) => {
    try {
        const { patientId, workerId, areaId, caseType } = req.body;

        if (!patientId || !workerId || !areaId || !caseType) {
            return res.status(400).json({
                success: false,
                message: "patientId, workerId, areaId and caseType are required",
            });
        }

        if (
            !mongoose.isValidObjectId(patientId) ||
            !mongoose.isValidObjectId(workerId) ||
            !mongoose.isValidObjectId(areaId)
        ) {
            return res.status(400).json({
                success: false,
                message: "patientId, workerId and areaId must be valid IDs",
            });
        }

        if (!allowedCaseTypes.includes(caseType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid caseType",
            });
        }

        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        const careCase = await CareCase.create({
            patientId,
            workerId,
            areaId,
            caseType,
            caseStatus: "screening_pending",
        });

        patient.currentCaseId = careCase._id;
        await patient.save();

        return res.status(201).json({
            success: true,
            message: "Care case created",
            data: {
                careCase: careCase,
            },
        });
    } catch (error) {
        console.error("Failed to create care case:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create care case",
        });
    }
};

const getCareCaseById = async (req, res) => {
    try {
        const { caseId } = req.params;

        if (!mongoose.isValidObjectId(caseId)) {
            return invalidObjectIdResponse(res, "care case");
        }

        const careCase = await CareCase.findById(caseId);

        if (!careCase) {
            return res.status(404).json({
                success: false,
                message: "Care case not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Care case fetched successfully",
            data: {
                careCase: careCase,
            },
        });
    } catch (error) {
        console.error("Failed to fetch care case:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch care case",
        });
    }
};

const submitScreening = async (req, res) => {
    try {
        const { caseId } = req.params;

        if (!mongoose.isValidObjectId(caseId)) {
            return invalidObjectIdResponse(res, "care case");
        }

        const careCase = await CareCase.findById(caseId);

        if (!careCase) {
            return res.status(404).json({
                success: false,
                message: "Care case not found",
            });
        }

        const patient = await Patient.findById(careCase.patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        const {
            symptoms,
            bloodPressure,
            bloodSugarMgDl,
            temperatureCelsius,
            weightKg,
            pregnancy,
            tuberculosis,
            notes,
        } = req.body;

        careCase.screening = {
            symptoms,
            bloodPressure,
            bloodSugarMgDl,
            temperatureCelsius,
            weightKg,
            pregnancy,
            tuberculosis,
            notes,
            completedAt: new Date(),
        };

        const {
            riskLevel,
            riskScore,
            riskReasons,
            recommendedAction,
        } = calculateRisk(careCase.screening);

        careCase.riskAssessment = {
            riskLevel,
            riskScore,
            riskReasons,
            recommendedAction,
            assessedAt: new Date(),
        };
        careCase.caseStatus = "screening_completed";
        patient.visitStatus = "screening_completed";

        if (riskLevel === "yellow" || riskLevel === "red") {
            careCase.referral.isRequired = true;
            careCase.referral.referralStatus = "recommended";
            careCase.caseStatus = "referral_pending";
            patient.visitStatus = "referral_pending";
        }

        await careCase.save();
        await patient.save();

        return res.status(200).json({
            success: true,
            message: "Screening submitted successfully",
            data: {
                careCase: careCase,
            },
        });
    } catch (error) {
        console.error("Failed to submit screening:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to submit screening",
        });
    }
};

const createReferral = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { facilityName, referralReason } = req.body;

        if (!mongoose.isValidObjectId(caseId)) {
            return invalidObjectIdResponse(res, "care case");
        }

        if (
            typeof facilityName !== "string" ||
            !facilityName.trim() ||
            typeof referralReason !== "string" ||
            !referralReason.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "facilityName and referralReason are required",
            });
        }

        const careCase = await CareCase.findById(caseId);

        if (!careCase) {
            return res.status(404).json({
                success: false,
                message: "Care case not found",
            });
        }

        careCase.referral.isRequired = true;
        careCase.referral.referralStatus = "created";
        careCase.referral.facilityName = facilityName.trim();
        careCase.referral.referralReason = referralReason.trim();
        careCase.referral.referredAt = new Date();
        careCase.caseStatus = "appointment_pending";

        await careCase.save();

        return res.status(200).json({
            success: true,
            message: "Referral created successfully",
            data: {
                careCase: careCase,
            },
        });
    } catch (error) {
        console.error("Failed to create referral:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create referral",
        });
    }
};

const scheduleAppointment = async (req, res) => {
    try {
        const { caseId } = req.params;
        const {
            hospitalName,
            appointmentDate,
            appointmentTime,
            appointmentNotes,
        } = req.body;

        if (!mongoose.isValidObjectId(caseId)) {
            return invalidObjectIdResponse(res, "care case");
        }

        if (!hospitalName || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message:
                    "hospitalName, appointmentDate and appointmentTime are required",
            });
        }

        const parsedAppointmentDate = new Date(appointmentDate);

        if (Number.isNaN(parsedAppointmentDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "appointmentDate must be a valid date",
            });
        }

        const careCase = await CareCase.findById(caseId);

        if (!careCase) {
            return res.status(404).json({
                success: false,
                message: "Care case not found",
            });
        }

        const patient = await Patient.findById(careCase.patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        careCase.appointment.appointmentStatus = "scheduled";
        careCase.appointment.hospitalName = hospitalName;
        careCase.appointment.appointmentDate = parsedAppointmentDate;
        careCase.appointment.appointmentTime = appointmentTime;
        careCase.appointment.appointmentNotes = appointmentNotes || "";
        careCase.caseStatus = "appointment_scheduled";

        patient.visitStatus = "appointment_scheduled";
        patient.nextVisitDate = parsedAppointmentDate;

        await careCase.save();
        await patient.save();

        return res.status(200).json({
            success: true,
            message: "Appointment scheduled successfully",
            data: {
                careCase: careCase,
            },
        });
    } catch (error) {
        console.error("Failed to schedule appointment:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to schedule appointment",
        });
    }
};

module.exports = {
    createCareCase,
    getCareCaseById,
    submitScreening,
    createReferral,
    scheduleAppointment,
};
