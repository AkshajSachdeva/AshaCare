const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
    {
        schemeName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        benefits: {
            type: [String],
            default: [],
        },
        eligibilityText: {
            type: String,
            default: "",
        },
        applicableCategories: {
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
        requiredDocuments: {
            type: [String],
            default: [],
        },
        applicationUrl: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Scheme = mongoose.model("Scheme", schemeSchema);

module.exports = Scheme;
