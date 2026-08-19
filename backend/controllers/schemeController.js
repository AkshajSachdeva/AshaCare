const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Scheme = require("../models/Scheme");
const User = require("../models/User");
const {
    awardSchemeRegistrationReward,
    rollbackSchemeRegistrationReward,
} = require("../utils/hospitalVisitReward");

const schemeFields =
    "schemeName description benefits eligibilityText applicableCategories requiredDocuments applicationUrl";
const allowedEnrollmentFields = ["schemeStatus"];
const enrollmentTransitions = {
    recommended: ["registration_started"],
    registration_started: ["registered"],
    registered: [],
};

const accessDeniedResponse = (res) =>
    res.status(403).json({
        success: false,
        message: "You do not have permission to access this patient",
    });

const isApplicableToPatient = (scheme, patient) =>
    scheme.applicableCategories.length === 0 ||
    scheme.applicableCategories.some((category) =>
        patient.healthCategories.includes(category)
    );

const authorizePatientAccess = async (req, res, patient) => {
    const { userId, role } = req.user;

    if (!mongoose.isValidObjectId(userId)) {
        res.status(401).json({
            success: false,
            message: "Invalid authentication token",
        });
        return false;
    }

    if (role === "asha_worker") {
        if (!patient.assignedWorkerId.equals(userId)) {
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
                areaId.equals(patient.areaId)
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

const getSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find()
            .select(schemeFields)
            .sort({ schemeName: 1 });

        return res.status(200).json({
            success: true,
            message: "Schemes retrieved successfully",
            data: {
                schemes,
            },
        });
    } catch (error) {
        console.error("Failed to retrieve schemes:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve schemes",
        });
    }
};

const getPatientApplicableSchemes = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }

        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        if (!(await authorizePatientAccess(req, res, patient))) {
            return;
        }

        const schemes = await Scheme.find()
            .select(schemeFields)
            .sort({ schemeName: 1 });
        const applicableSchemes = schemes
            .filter((scheme) => isApplicableToPatient(scheme, patient))
            .map((scheme) => {
                const enrollment = patient.schemeEnrollments.find(
                    (entry) => entry.schemeId.equals(scheme._id)
                );

                return {
                    schemeId: scheme._id,
                    schemeName: scheme.schemeName,
                    description: scheme.description,
                    benefits: scheme.benefits,
                    eligibilityText: scheme.eligibilityText,
                    applicableCategories: scheme.applicableCategories,
                    requiredDocuments: scheme.requiredDocuments,
                    applicationUrl: scheme.applicationUrl,
                    schemeStatus: enrollment ? enrollment.schemeStatus : null,
                    recommendationReason: enrollment
                        ? enrollment.recommendationReason
                        : "",
                    registeredAt: enrollment ? enrollment.registeredAt : null,
                };
            });

        return res.status(200).json({
            success: true,
            message: "Applicable schemes retrieved successfully",
            data: {
                schemes: applicableSchemes,
            },
        });
    } catch (error) {
        console.error("Failed to retrieve applicable schemes:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve applicable schemes",
        });
    }
};

const updatePatientSchemeEnrollment = async (req, res) => {
    try {
        const { patientId, schemeId } = req.params;
        const enrollmentInput = req.body || {};
        const { schemeStatus } = enrollmentInput;
        const unsupportedFields = Object.keys(enrollmentInput).filter(
            (field) => !allowedEnrollmentFields.includes(field)
        );

        if (!mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }

        if (!mongoose.isValidObjectId(schemeId)) {
            return res.status(404).json({
                success: false,
                message: "Scheme not found",
            });
        }

        if (unsupportedFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid enrollment fields",
            });
        }

        if (!Object.hasOwn(enrollmentTransitions, schemeStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid schemeStatus",
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
            return accessDeniedResponse(res);
        }

        const scheme = await Scheme.findById(schemeId).select(schemeFields);

        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: "Scheme not found",
            });
        }

        if (!isApplicableToPatient(scheme, patient)) {
            return res.status(400).json({
                success: false,
                message: "Scheme is not applicable to this patient",
            });
        }

        const enrollment = patient.schemeEnrollments.find((entry) =>
            entry.schemeId.equals(scheme._id)
        );

        if (!enrollment) {
            if (schemeStatus === "registered") {
                return res.status(400).json({
                    success: false,
                    message: "Enrollment must be started before it can be registered",
                });
            }

            patient.schemeEnrollments.push({
                schemeId: scheme._id,
                schemeName: scheme.schemeName,
                recommendationReason: "Applicable based on patient health category",
                schemeStatus,
                registeredAt: null,
            });

            await patient.save();

            return res.status(200).json({
                success: true,
                message: "Patient scheme enrollment updated successfully",
                data: {
                    enrollment: patient.schemeEnrollments.at(-1),
                },
            });
        }

        if (enrollment.schemeStatus === schemeStatus) {
            return res.status(200).json({
                success: true,
                message: "Patient scheme enrollment is already up to date",
                data: {
                    enrollment,
                },
            });
        }

        if (!enrollmentTransitions[enrollment.schemeStatus].includes(schemeStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid scheme enrollment transition",
            });
        }

        enrollment.schemeStatus = schemeStatus;

        let rewardResult;

        if (schemeStatus === "registered") {
            enrollment.registeredAt = new Date();
            rewardResult = await awardSchemeRegistrationReward(
                req.user.userId,
                patient._id
            );
        }

        try {
            await patient.save();
        } catch (error) {
            if (rewardResult?.created) {
                try {
                    await rollbackSchemeRegistrationReward(
                        rewardResult.rewardTransaction
                    );
                } catch (rollbackError) {
                    console.error(
                        "Failed to roll back scheme registration reward:",
                        rollbackError.message
                    );
                }
            }

            throw error;
        }

        return res.status(200).json({
            success: true,
            message: "Patient scheme enrollment updated successfully",
            data: {
                enrollment,
            },
        });
    } catch (error) {
        console.error("Failed to update patient scheme enrollment:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to update patient scheme enrollment",
        });
    }
};

module.exports = {
    getSchemes,
    getPatientApplicableSchemes,
    updatePatientSchemeEnrollment,
};
