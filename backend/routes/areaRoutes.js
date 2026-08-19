const express = require("express");
const { getMyAreas } = require("../controllers/areaController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my-areas", authenticate, getMyAreas);

module.exports = router;
