const express = require("express");
const {
    login,
    getAuthenticatedUser,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", authenticate, getAuthenticatedUser);

module.exports = router;
