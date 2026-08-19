const mongoose = require("mongoose");

const bloodPressureSchema = new mongoose.Schema(
    {
        systolic: { type: Number, default: null },
        diastolic: { type: Number, default: null },
    },
    { _id: false }
);

const pregnancySchema = new mongoose.Schema(
    {
        isPregnant: { type: Boolean, default: false },
        pregnancyWeeks: { type: Number, default: null },
        dangerSigns: { type: [String], default: [] },
    },
    { _id: false }
);

const tuberculosisSchema = new mongoose.Schema(
    {
        coughDurationWeeks: { type: Number, default: null },
        feverPresent: { type: Boolean, default: false },
        nightSweatsPresent: { type: Boolean, default: false },
        weightLossPresent: { type: Boolean, default: false },
    },
    { _id: false }
);

const screeningSchema = new mongoose.Schema(
    {
        symptoms: { type: [String], default: [] },
        bloodPressure: { type: bloodPressureSchema, default: () => ({}) },
        bloodSugarMgDl: { type: Number, default: null },
        temperatureCelsius: { type: Number, default: null },
        weightKg: { type: Number, default: null },
        pregnancy: { type: pregnancySchema, default: () => ({}) },
        tuberculosis: { type: tuberculosisSchema, default: () => ({}) },
        notes: { type: String, default: "" },
        completedAt: { type: Date, default: null },
    },
    { _id: false }
);

const riskAssessmentSchema = new mongoose.Schema(
    {
        riskLevel: {
            type: String,
            enum: ["green", "yellow", "red", null],
            default: null,
        },
        riskScore: { type: Number, default: null },
        riskReasons: { type: [String], default: [] },
        recommendedAction: {
            type: String,
            enum: [
                "routine_care",
                "revisit",
                "doctor_visit",
                "urgent_referral",
                null,
            ],
            default: null,
        },
        assessedAt: { type: Date, default: null },
    },
    { _id: false }
);

const referralSchema = new mongoose.Schema(
    {
        isRequired: { type: Boolean, default: false },
        referralStatus: {
            type: String,
            enum: ["not_required", "recommended", "created"],
            default: "not_required",
        },
        facilityName: { type: String, default: "" },
        referralReason: { type: String, default: "" },
        referredAt: { type: Date, default: null },
    },
    { _id: false }
);

const appointmentSchema = new mongoose.Schema(
    {
        appointmentStatus: {
            type: String,
            enum: ["not_scheduled", "scheduled", "visited", "missed"],
            default: "not_scheduled",
        },
        hospitalName: { type: String, default: "" },
        appointmentDate: { type: Date, default: null },
        appointmentTime: { type: String, default: "" },
        appointmentNotes: { type: String, default: "" },
    },
    { _id: false }
);

const followUpSchema = new mongoose.Schema(
    {
        followUpStatus: {
            type: String,
            enum: ["not_due", "due", "completed"],
            default: "not_due",
        },
        dueDate: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        patientVisitedHospital: { type: Boolean, default: null },
        followUpNotes: { type: String, default: "" },
    },
    { _id: false }
);

const proofSchema = new mongoose.Schema(
    {
        proofStatus: {
            type: String,
            enum: ["not_uploaded", "uploaded", "verified", "rejected"],
            default: "not_uploaded",
        },
        fileUrl: { type: String, default: "" },
        fileName: { type: String, default: "" },
        uploadedAt: { type: Date, default: null },
        verificationMessage: { type: String, default: "" },
        verifiedAt: { type: Date, default: null },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { _id: false }
);

const careCaseSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        areaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Area",
            required: true,
        },
        caseType: {
            type: String,
            enum: [
                "pregnancy",
                "blood_pressure",
                "diabetes",
                "tuberculosis",
            ],
            required: true,
        },
        caseStatus: {
            type: String,
            enum: [
                "screening_pending",
                "screening_completed",
                "referral_pending",
                "appointment_pending",
                "appointment_scheduled",
                "follow_up_due",
                "proof_pending",
                "verification_pending",
                "verified",
                "closed",
            ],
            default: "screening_pending",
        },
        screening: { type: screeningSchema, default: () => ({}) },
        riskAssessment: { type: riskAssessmentSchema, default: () => ({}) },
        referral: { type: referralSchema, default: () => ({}) },
        appointment: { type: appointmentSchema, default: () => ({}) },
        followUp: { type: followUpSchema, default: () => ({}) },
        proof: { type: proofSchema, default: () => ({}) },
    },
    { timestamps: true }
);

const CareCase = mongoose.model("CareCase", careCaseSchema);

module.exports = CareCase;
