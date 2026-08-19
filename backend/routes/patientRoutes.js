const express = require("express");
const { getPatientById } = require("../controllers/patientController");

const router = express.Router();

router.get("/:patientId", getPatientById);

module.exports = router;
