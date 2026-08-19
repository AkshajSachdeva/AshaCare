const express = require("express");
const {
    createCareCase,
    getCareCaseById,
    submitScreening,
    createReferral,
    scheduleAppointment,
    updateFollowUp,
    submitProof,
    verifyProof,
} = require("../controllers/caseController");
const {
    authenticate,
    requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, requireRole("asha_worker"), createCareCase);
router.get("/:caseId", authenticate, getCareCaseById);
router.put("/:caseId/screening", authenticate, submitScreening);
router.put("/:caseId/referral", authenticate, createReferral);
router.put("/:caseId/appointment", authenticate, scheduleAppointment);
router.put("/:caseId/follow-up", authenticate, updateFollowUp);
router.put(
    "/:caseId/proof",
    authenticate,
    requireRole("asha_worker"),
    submitProof
);
router.put(
    "/:caseId/proof/verify",
    authenticate,
    requireRole("supervisor"),
    verifyProof
);

module.exports = router;
