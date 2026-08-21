// Temporary frontend data. Replace this file with scheme API calls when the
// backend scheme endpoints are available.
export const mockSchemes = [
    {
        _id: "mock-maternal-health-support",
        schemeName: "Maternal Health Support",
        description: "Support for pregnant patients receiving institutional care.",
        benefits: [
            "Maternal healthcare support",
            "Assistance with institutional care",
        ],
        eligibilityText:
            "Pregnant patients may be recommended this scheme in the demo.",
        applicableCategories: ["pregnancy"],
        requiredDocuments: ["Aadhaar Card", "Pregnancy Registration Document"],
        applicationUrl: "",
    },
    {
        _id: "mock-chronic-care-support",
        schemeName: "Chronic Care Support",
        description: "Support for patients managing diabetes or blood pressure.",
        benefits: ["Chronic care support", "Screening assistance"],
        eligibilityText:
            "Patients with diabetes or blood-pressure health categories may be recommended this scheme.",
        applicableCategories: ["diabetes", "blood_pressure"],
        requiredDocuments: ["Aadhaar Card", "Health Record"],
        applicationUrl: "",
    },
    {
        _id: "mock-tuberculosis-care-support",
        schemeName: "Tuberculosis Care Support",
        description: "Care coordination and follow-up support for tuberculosis care.",
        benefits: ["Care coordination support", "Follow-up support"],
        eligibilityText:
            "Patients with a tuberculosis health category may be recommended this scheme.",
        applicableCategories: ["tuberculosis"],
        requiredDocuments: ["Aadhaar Card", "Health Record"],
        applicationUrl: "",
    },
];
