const express = require("express");
const { getMyRewards } = require("../controllers/rewardController");
const {
    authenticate,
    requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my-rewards", authenticate, requireRole("asha_worker"), getMyRewards);

module.exports = router;
