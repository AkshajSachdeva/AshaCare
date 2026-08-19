const mongoose = require("mongoose");
const Patient = require("../models/Patient");

const getPatientById = async (req, res) => {
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
    getPatientById,
};
