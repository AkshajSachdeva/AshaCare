const mongoose = require("mongoose");

const schemeEnrollmentSchema = new mongoose.Schema(
    {
        schemeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scheme",
            required: true,
        },
        schemeName: {
            type: String,
            required: true,
        },
        recommendationReason: {
            type: String,
            default: "",
        },
        schemeStatus: {
            type: String,
            enum: ["recommended", "registration_started", "registered"],
            default: "recommended",
        },
        registeredAt: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

const patientSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            required: true,
            min: 0,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true,
        },
        phoneNumber: {
            type: String,
            default: "",
            trim: true,
        },
        address: {
            type: String,
            default: "",
            trim: true,
        },
        areaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Area",
            required: true,
        },
        assignedWorkerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        healthCategories: {
            type: [
                {
                    type: String,
                    enum: [
                        "pregnancy",
                        "blood_pressure",
                        "diabetes",
                        "tuberculosis",
                    ],
                },
            ],
            default: [],
        },
        visitStatus: {
            type: String,
            enum: [
                "not_visited",
                "visit_due",
                "screening_completed",
                "referral_pending",
                "appointment_scheduled",
                "follow_up_due",
                "verification_pending",
                "verified",
            ],
            default: "not_visited",
        },
        lastVisitDate: {
            type: Date,
            default: null,
        },
        nextVisitDate: {
            type: Date,
            default: null,
        },
        currentCaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CareCase",
            default: null,
        },
        schemeEnrollments: {
            type: [schemeEnrollmentSchema],
            default: [],
        },
    },
    { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
