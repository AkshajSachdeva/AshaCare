const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
    {
        areaName: {
            type: String,
            required: true,
            trim: true,
        },
        areaType: {
            type: String,
            enum: ["district", "village", "ward"],
            default: "village",
        },
        districtName: {
            type: String,
            default: "",
            trim: true,
        },
        stateName: {
            type: String,
            default: "",
            trim: true,
        },
        assignedWorkerIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

const Area = mongoose.model("Area", areaSchema);

module.exports = Area;
