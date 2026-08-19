const mongoose = require("mongoose");
const CareCase = require("../models/CareCase");
const Patient = require("../models/Patient");
const User = require("../models/User");
const calculateRisk = require("../utils/calculateRisk");
const {
    awardHospitalVisitReward,
    rollbackHospitalVisitReward,
} = require("../utils/hospitalVisitReward");

const allowedCaseTypes = [
    "pregnancy",
    "blood_pressure",
    "diabetes",
    "tuberculosis",
];

const allowedFollowUpFields = [
    "followUpStatus",
    "dueDate",
    "patientVisitedHospital",
    "followUpNotes",
];

const allowedProofSubmissionFields = ["fileUrl", "fileName"];
const allowedProofVerificationFields = [
    "verificationStatus",
    "verificationNotes",
];

const invalidObjectIdResponse = (res, objectName) =>
    res.status(400).json({
        success: false,
        message: `Invalid ${objectName} ID`,
    });

const accessDeniedResponse = (res) =>
    res.status(403).json({
        success: false,
        message: "You do not have permission to access this care case",
    });

const authorizeCareCaseAccess = async (req, res, careCase) => {
    const { userId, role } = req.user;

    if (!mongoose.isValidObjectId(userId)) {
        res.status(401).json({
            success: false,
            message: "Invalid authentication token",
        });
        return false;
    }

    if (role === "asha_worker") {
        if (!careCase.workerId.equals(userId)) {
            accessDeniedResponse(res);
            return false;
        }

        return true;
    }

    if (role === "supervisor") {
        const supervisor = await User.findById(userId).select("assignedAreaIds");

        if (!supervisor) {
            res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
            return false;
        }

        if (
            !supervisor.assignedAreaIds.some((areaId) =>
                areaId.equals(careCase.areaId)
            )
        ) {
            accessDeniedResponse(res);
            return false;
        }

        return true;
    }

    accessDeniedResponse(res);
    return false;
};

const createCareCase = async (req, res) => {
    try {
        const { patientId, areaId, caseType } = req.body;

        if (!patientId || !areaId || !caseType) {
            return res.status(400).json({
                success: false,
                message: "patientId, areaId and caseType are required",
            });
        }

        if (
            !mongoose.isValidObjectId(patientId) ||
            !mongoose.isValidObjectId(areaId)
        ) {
            return res.status(400).json({
                success: false,
                message: "patientId and areaId must be valid IDs",
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

        if (!patient.assignedWorkerId.equals(req.user.userId)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to create a care case for this patient",
            });
        }

        if (!patient.areaId.equals(areaId)) {
            return res.status(400).json({
                success: false,
                message: "areaId must match the patient's assigned area",
            });
        }

        const careCase = await CareCase.create({
            patientId,
            workerId: req.user.userId,
            areaId: patient.areaId,
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

        if (!(await authorizeCareCaseAccess(req, res, careCase))) {
            return;
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

        if (!(await authorizeCareCaseAccess(req, res, careCase))) {
            return;
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

        if (!(await authorizeCareCaseAccess(req, res, careCase))) {
            return;
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

        if (!(await authorizeCareCaseAccess(req, res, careCase))) {
            return;
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

const updateFollowUp = async (req, res) => {
    try {
        const { caseId } = req.params;
        const {
            followUpStatus,
            dueDate,
            patientVisitedHospital,
            followUpNotes,
        } = req.body;
        const unsupportedFields = Object.keys(req.body).filter(
            (field) => !allowedFollowUpFields.includes(field)
        );

        if (!mongoose.isValidObjectId(caseId)) {
            return invalidObjectIdResponse(res, "care case");
        }

        if (unsupportedFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid follow-up fields",
            });
        }

        if (followUpStatus !== "due" && followUpStatus !== "completed") {
            return res.status(400).json({
                success: false,
                message: "followUpStatus must be due or completed",
            });
        }

        if (
            dueDate !== undefined &&
            (typeof dueDate !== "string" || Number.isNaN(new Date(dueDate).getTime()))
        ) {
            return res.status(400).json({
                success: false,
                message: "dueDate must be a valid date",
            });
        }

        if (
            patientVisitedHospital !== undefined &&
            typeof patientVisitedHospital !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "patientVisitedHospital must be a boolean",
            });
        }

        if (
            followUpNotes !== undefined &&
            typeof followUpNotes !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "followUpNotes must be a string",
            });
        }

        const careCase = await CareCase.findById(caseId);

        if (!careCase) {
            return res.status(404).json({
                success: false,
                message: "Care case not found",
            });
        }

        if (!(await authorizeCareCaseAccess(req, res, careCase))) {
            return;
        }

        const patient = await Patient.findById(careCase.patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        if (followUpStatus === "due") {
            if (
                careCase.caseStatus !== "appointment_scheduled" &&
                careCase.caseStatus !== "follow_up_due"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Follow-up can only become due after an appointment is scheduled",
                });
            }

            if (!dueDate && !careCase.followUp.dueDate) {
                return res.status(400).json({
                    success: false,
                    message: "dueDate is required when a follow-up becomes due",
                });
            }

            careCase.followUp.followUpStatus = "due";
            careCase.caseStatus = "follow_up_due";
            patient.visitStatus = "follow_up_due";
        } else {
            if (
                careCase.caseStatus !== "follow_up_due" ||
                careCase.followUp.followUpStatus !== "due"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Follow-up must be due before it can be completed",
                });
            }

            if (typeof patientVisitedHospital !== "boolean") {
                return res.status(400).json({
                    success: false,
                    message: "patientVisitedHospital is required when completing follow-up",
                });
            }

            careCase.followUp.followUpStatus = "completed";
            careCase.followUp.completedAt = new Date();
            careCase.caseStatus = "proof_pending";
            patient.visitStatus = "verification_pending";
        }

        if (dueDate !== undefined) {
            careCase.followUp.dueDate = new Date(dueDate);
        }

        if (patientVisitedHospital !== undefined) {
            careCase.followUp.patientVisitedHospital = patientVisitedHospital;
        }

        if (followUpNotes !== undefined) {
            careCase.followUp.followUpNotes = followUpNotes.trim();
        }

        await careCase.save();
        await patient.save();

        return res.status(200).json({
            success: true,
            message: "Follow-up updated successfully",
            data: {
                case: careCase,
            },
        });
    } catch (error) {
        console.error("Failed to update follow-up:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to update follow-up",
        });
    }
};

const submitProof = async (req, res) => {
    try {
        const { caseId } = req.params;
        const proofInput = req.body || {};
        const { fileUrl, fileName } = proofInput;
        const unsupportedFields = Object.keys(proofInput).filter(
            (field) => !allowedProofSubmissionFields.includes(field)
        );

        if (!mongoose.isValidObjectId(caseId)) {
            return invalidObjectIdResponse(res, "care case");
        }

        if (unsupportedFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid proof fields",
            });
        }

        if (
            typeof fileUrl !== "string" ||
            !fileUrl.trim() ||
            typeof fileName !== "string" ||
            !fileName.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "fileUrl and fileName are required",
            });
        }

        const careCase = await CareCase.findById(caseId);

        if (!careCase) {
            return res.status(404).json({
                success: false,
                message: "Care case not found",
            });
        }

        if (!(await authorizeCareCaseAccess(req, res, careCase))) {
            return;
        }

        if (careCase.caseStatus !== "proof_pending") {
            return res.status(400).json({
                success: false,
                message: "Proof can only be submitted when a case is proof pending",
            });
        }

        if (
            careCase.proof.proofStatus !== "not_uploaded" &&
            careCase.proof.proofStatus !== "rejected"
        ) {
            return res.status(400).json({
                success: false,
                message: "Proof is already awaiting verification",
            });
        }

        const patient = await Patient.findById(careCase.patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        careCase.proof.proofStatus = "uploaded";
        careCase.proof.fileUrl = fileUrl.trim();
        careCase.proof.fileName = fileName.trim();
        careCase.proof.uploadedAt = new Date();
        careCase.proof.verifiedAt = null;
        careCase.proof.verifiedBy = null;
        careCase.proof.verificationMessage = "";
        patient.visitStatus = "verification_pending";

        await careCase.save();
        await patient.save();

        return res.status(200).json({
            success: true,
            message: "Proof submitted successfully",
            data: {
                case: careCase,
            },
        });
    } catch (error) {
        console.error("Failed to submit proof:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to submit proof",
        });
    }
};

const verifyProof = async (req, res) => {
    try {
        const { caseId } = req.params;
        const verificationInput = req.body || {};
        const { verificationStatus, verificationNotes } = verificationInput;
        const unsupportedFields = Object.keys(verificationInput).filter(
            (field) => !allowedProofVerificationFields.includes(field)
        );

        if (!mongoose.isValidObjectId(caseId)) {
            return invalidObjectIdResponse(res, "care case");
        }

        if (unsupportedFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification fields",
            });
        }

        if (
            verificationStatus !== "verified" &&
            verificationStatus !== "rejected"
        ) {
            return res.status(400).json({
                success: false,
                message: "verificationStatus must be verified or rejected",
            });
        }

        if (
            verificationNotes !== undefined &&
            typeof verificationNotes !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "verificationNotes must be a string",
            });
        }

        if (
            verificationStatus === "rejected" &&
            (!verificationNotes || !verificationNotes.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "verificationNotes are required when rejecting proof",
            });
        }

        const careCase = await CareCase.findById(caseId);

        if (!careCase) {
            return res.status(404).json({
                success: false,
                message: "Care case not found",
            });
        }

        if (!(await authorizeCareCaseAccess(req, res, careCase))) {
            return;
        }

        if (
            verificationStatus === "verified" &&
            careCase.caseStatus === "verified" &&
            careCase.proof.proofStatus === "verified"
        ) {
            return res.status(200).json({
                success: true,
                message: "Proof verified successfully",
                data: {
                    case: careCase,
                },
            });
        }

        if (
            careCase.caseStatus !== "proof_pending" ||
            careCase.proof.proofStatus !== "uploaded"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only uploaded proof for a proof-pending case can be verified",
            });
        }

        const patient = await Patient.findById(careCase.patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        careCase.proof.proofStatus = verificationStatus;
        careCase.proof.verifiedAt = new Date();
        careCase.proof.verifiedBy = req.user.userId;
        careCase.proof.verificationMessage = verificationNotes
            ? verificationNotes.trim()
            : "";

        let rewardResult;

        if (verificationStatus === "verified") {
            careCase.caseStatus = "verified";
            patient.visitStatus = "verified";
            rewardResult = await awardHospitalVisitReward(careCase);
        } else {
            careCase.caseStatus = "proof_pending";
            patient.visitStatus = "verification_pending";
        }

        try {
            await careCase.save();
            await patient.save();
        } catch (error) {
            if (rewardResult?.created) {
                try {
                    await rollbackHospitalVisitReward(
                        rewardResult.rewardTransaction
                    );
                } catch (rollbackError) {
                    console.error(
                        "Failed to roll back hospital visit reward:",
                        rollbackError.message
                    );
                }
            }

            throw error;
        }

        return res.status(200).json({
            success: true,
            message:
                verificationStatus === "verified"
                    ? "Proof verified successfully"
                    : "Proof rejected",
            data: {
                case: careCase,
            },
        });
    } catch (error) {
        console.error("Failed to verify proof:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to verify proof",
        });
    }
};

module.exports = {
    createCareCase,
    getCareCaseById,
    submitScreening,
    createReferral,
    scheduleAppointment,
    updateFollowUp,
    submitProof,
    verifyProof,
};
