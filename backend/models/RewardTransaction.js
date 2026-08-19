const mongoose = require("mongoose");

const rewardTransactionSchema = new mongoose.Schema(
    {
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CareCase",
            default: null,
        },
        actionType: {
            type: String,
            enum: [
                "hospital_visit_verified",
                "follow_up_completed",
                "scheme_registered",
            ],
            required: true,
        },
        points: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

rewardTransactionSchema.index(
    { workerId: 1, caseId: 1, actionType: 1 },
    {
        unique: true,
        partialFilterExpression: { actionType: "hospital_visit_verified" },
    }
);

rewardTransactionSchema.index(
    { workerId: 1, patientId: 1, actionType: 1 },
    {
        unique: true,
        partialFilterExpression: { actionType: "scheme_registered" },
    }
);

const RewardTransaction = mongoose.model(
    "RewardTransaction",
    rewardTransactionSchema
);

module.exports = RewardTransaction;
