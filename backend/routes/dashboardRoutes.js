const express = require("express");
const {
    getWorkerDashboard,
} = require("../controllers/dashboardController");
const {
    authenticate,
    requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/worker",
    authenticate,
    requireRole("asha_worker"),
    getWorkerDashboard
);

module.exports = router;
