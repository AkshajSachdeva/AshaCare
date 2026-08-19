const express = require("express");
const {
    getPatients,
    getPatientById,
} = require("../controllers/patientController");
const {
    getPatientApplicableSchemes,
    updatePatientSchemeEnrollment,
} = require("../controllers/schemeController");
const {
    authenticate,
    requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getPatients);
router.get("/:patientId/schemes", authenticate, getPatientApplicableSchemes);
router.put(
    "/:patientId/schemes/:schemeId",
    authenticate,
    requireRole("asha_worker"),
    updatePatientSchemeEnrollment
);
router.get("/:patientId", authenticate, getPatientById);

module.exports = router;
