require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDatabase = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const areaRoutes = require("./routes/areaRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const patientRoutes = require("./routes/patientRoutes");
const caseRoutes = require("./routes/caseRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const schemeRoutes = require("./routes/schemeRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
        origin: process.env.CLIENT_URL,
    })
);
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AshaCare API is running",
        data: {},
    });
});

app.use("/api/patients", patientRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/schemes", schemeRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

const startServer = async () => {
    await connectDatabase();
    app.listen(port, () => {
        console.log(`AshaCare API listening on port ${port}`);
    });
};

startServer();
