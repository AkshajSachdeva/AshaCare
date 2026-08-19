const express = require("express");
const { getSchemes } = require("../controllers/schemeController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getSchemes);

module.exports = router;
