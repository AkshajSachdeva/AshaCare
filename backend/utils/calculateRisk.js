// Deterministic decision-support rules for the AshaCare hackathon demo only.
// This function does not diagnose disease or replace medical assessment.
const calculateRisk = (screening) => {
    const systolic = Number(screening?.bloodPressure?.systolic);
    const diastolic = Number(screening?.bloodPressure?.diastolic);
    const bloodSugarMgDl = Number(screening?.bloodSugarMgDl);
    const temperatureCelsius = Number(screening?.temperatureCelsius);
    const coughDurationWeeks = Number(
        screening?.tuberculosis?.coughDurationWeeks
    );
    const dangerSigns = Array.isArray(screening?.pregnancy?.dangerSigns)
        ? screening.pregnancy.dangerSigns
        : [];

    const redReasons = [];

    if (Number.isFinite(systolic) && systolic >= 160) {
        redReasons.push("Systolic blood pressure meets a red demo threshold");
    }

    if (Number.isFinite(diastolic) && diastolic >= 110) {
        redReasons.push("Diastolic blood pressure meets a red demo threshold");
    }

    if (dangerSigns.length >= 2) {
        redReasons.push("Multiple pregnancy danger signs were recorded");
    }

    if (Number.isFinite(bloodSugarMgDl) && bloodSugarMgDl >= 300) {
        redReasons.push("Blood sugar meets a red demo threshold");
    }

    if (redReasons.length > 0) {
        return {
            riskLevel: "red",
            riskScore: 85,
            riskReasons: redReasons,
            recommendedAction: "urgent_referral",
        };
    }

    const yellowReasons = [];

    if (Number.isFinite(systolic) && systolic >= 140) {
        yellowReasons.push("Systolic blood pressure meets a yellow demo threshold");
    }

    if (Number.isFinite(diastolic) && diastolic >= 90) {
        yellowReasons.push("Diastolic blood pressure meets a yellow demo threshold");
    }

    if (Number.isFinite(bloodSugarMgDl) && bloodSugarMgDl >= 200) {
        yellowReasons.push("Blood sugar meets a yellow demo threshold");
    }

    if (Number.isFinite(temperatureCelsius) && temperatureCelsius >= 38) {
        yellowReasons.push("Temperature meets a yellow demo threshold");
    }

    if (Number.isFinite(coughDurationWeeks) && coughDurationWeeks >= 2) {
        yellowReasons.push("Cough duration meets a yellow demo threshold");
    }

    if (dangerSigns.length === 1) {
        yellowReasons.push("One pregnancy danger sign was recorded");
    }

    if (yellowReasons.length > 0) {
        return {
            riskLevel: "yellow",
            riskScore: 60,
            riskReasons: yellowReasons,
            recommendedAction: "doctor_visit",
        };
    }

    return {
        riskLevel: "green",
        riskScore: 25,
        riskReasons: ["No high-risk demo screening criteria detected"],
        recommendedAction: "routine_care",
    };
};

module.exports = calculateRisk;
