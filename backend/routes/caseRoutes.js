const express = require("express");
const {
    createCareCase,
    getCareCaseById,
    submitScreening,
    createReferral,
    scheduleAppointment,
} = require("../controllers/caseController");

const router = express.Router();

router.post("/", createCareCase);
router.get("/:caseId", getCareCaseById);
router.put("/:caseId/screening", submitScreening);
router.put("/:caseId/referral", createReferral);
router.put("/:caseId/appointment", scheduleAppointment);

module.exports = router;
