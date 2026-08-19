require("dotenv").config();

const connectDatabase = require("./config/db");
const User = require("./models/User");
const Area = require("./models/Area");
const Patient = require("./models/Patient");
const CareCase = require("./models/CareCase");
const Scheme = require("./models/Scheme");
const RewardTransaction = require("./models/RewardTransaction");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const daysFromNow = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const seedDatabase = async () => {
    try {
        await connectDatabase();

        await RewardTransaction.deleteMany({});
        await CareCase.deleteMany({});
        await Patient.deleteMany({});
        await Scheme.deleteMany({});
        await Area.deleteMany({});
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash("123456", 10);

        const ashaWorker1 = await User.create({
            fullName: "Sunita Sharma",
            phoneNumber: "9876543210",
            email: "sunita.asha@ashacare.demo",
            passwordHash: passwordHash,
            role: "asha_worker",
            assignedAreaIds: [],
            preferredLanguage: "hi",
            totalPoints: 0,
        });

        const ashaWorker2 = await User.create({
            fullName: "Meena Patel",
            phoneNumber: "9876543211",
            email: "meena.asha@ashacare.demo",
            passwordHash: passwordHash,
            role: "asha_worker",
            assignedAreaIds: [],
            preferredLanguage: "en",
            totalPoints: 0,
        });

        const supervisor = await User.create({
            fullName: "Dr. Kavita Rao",
            phoneNumber: "9876543299",
            email: "supervisor@ashacare.demo",
            passwordHash: passwordHash,
            role: "supervisor",
            assignedAreaIds: [],
            preferredLanguage: "en",
            totalPoints: 0,
        });

        const rampurArea = await Area.create({
            areaName: "Rampur",
            areaType: "village",
            districtName: "Demo District",
            stateName: "Gujarat",
            assignedWorkerIds: [ashaWorker1._id],
        });

        const shantinagarArea = await Area.create({
            areaName: "Shantinagar",
            areaType: "village",
            districtName: "Demo District",
            stateName: "Gujarat",
            assignedWorkerIds: [ashaWorker1._id],
        });

        const navapuraArea = await Area.create({
            areaName: "Navapura",
            areaType: "village",
            districtName: "Demo District",
            stateName: "Gujarat",
            assignedWorkerIds: [ashaWorker2._id],
        });

        ashaWorker1.assignedAreaIds = [rampurArea._id, shantinagarArea._id];
        ashaWorker2.assignedAreaIds = [navapuraArea._id];
        await ashaWorker1.save();
        await ashaWorker2.save();

        // These schemes and eligibility statements are example data for the hackathon demo only.
        const maternalHealthScheme = await Scheme.create({
            schemeName: "Maternal Health Support",
            description: "Demo scheme for maternal healthcare assistance.",
            benefits: [
                "Maternal healthcare support",
                "Assistance with institutional care",
            ],
            eligibilityText:
                "Demo eligibility: pregnant patients may be shown this scheme for hackathon demonstration.",
            applicableCategories: ["pregnancy"],
            requiredDocuments: [
                "Aadhaar Card",
                "Pregnancy Registration Document",
            ],
            applicationUrl: "",
        });

        const diabetesSupportScheme = await Scheme.create({
            schemeName: "Chronic Care Support",
            description:
                "Demo support scheme for chronic healthcare management.",
            benefits: ["Chronic care support", "Screening assistance"],
            eligibilityText:
                "Demo eligibility based on patient health category.",
            applicableCategories: ["diabetes", "blood_pressure"],
            requiredDocuments: ["Aadhaar Card", "Health Record"],
            applicationUrl: "",
        });

        const tbSupportScheme = await Scheme.create({
            schemeName: "Tuberculosis Care Support",
            description: "Demo scheme for tuberculosis care support.",
            benefits: ["Care coordination support", "Follow-up support"],
            eligibilityText:
                "Demo eligibility based on tuberculosis-related health category.",
            applicableCategories: ["tuberculosis"],
            requiredDocuments: ["Aadhaar Card", "Health Record"],
            applicationUrl: "",
        });

        const patientSunita = await Patient.create({
            fullName: "Sunita Devi",
            age: 28,
            gender: "female",
            phoneNumber: "9000000001",
            address: "Rampur, Demo District",
            areaId: rampurArea._id,
            assignedWorkerId: ashaWorker1._id,
            healthCategories: ["pregnancy"],
            visitStatus: "follow_up_due",
            lastVisitDate: daysFromNow(-3),
            nextVisitDate: daysFromNow(2),
            currentCaseId: null,
            schemeEnrollments: [
                {
                    schemeId: maternalHealthScheme._id,
                    schemeName: maternalHealthScheme.schemeName,
                    recommendationReason:
                        "Demo recommendation based on pregnancy category.",
                    schemeStatus: "recommended",
                    registeredAt: null,
                },
            ],
        });

        const patientRamesh = await Patient.create({
            fullName: "Ramesh Kumar",
            age: 52,
            gender: "male",
            phoneNumber: "9000000002",
            address: "Rampur, Demo District",
            areaId: rampurArea._id,
            assignedWorkerId: ashaWorker1._id,
            healthCategories: ["blood_pressure"],
            visitStatus: "visit_due",
            lastVisitDate: null,
            nextVisitDate: daysFromNow(3),
            currentCaseId: null,
            schemeEnrollments: [],
        });

        const patientAsha = await Patient.create({
            fullName: "Asha Ben",
            age: 46,
            gender: "female",
            phoneNumber: "9000000003",
            address: "Shantinagar, Demo District",
            areaId: shantinagarArea._id,
            assignedWorkerId: ashaWorker1._id,
            healthCategories: ["diabetes"],
            visitStatus: "verification_pending",
            lastVisitDate: daysFromNow(-5),
            nextVisitDate: daysFromNow(10),
            currentCaseId: null,
            schemeEnrollments: [
                {
                    schemeId: diabetesSupportScheme._id,
                    schemeName: diabetesSupportScheme.schemeName,
                    recommendationReason:
                        "Demo recommendation based on diabetes category.",
                    schemeStatus: "recommended",
                    registeredAt: null,
                },
            ],
        });

        const patientMohan = await Patient.create({
            fullName: "Mohan Lal",
            age: 61,
            gender: "male",
            phoneNumber: "9000000004",
            address: "Shantinagar, Demo District",
            areaId: shantinagarArea._id,
            assignedWorkerId: ashaWorker1._id,
            healthCategories: ["tuberculosis"],
            visitStatus: "referral_pending",
            lastVisitDate: daysFromNow(-2),
            nextVisitDate: daysFromNow(1),
            currentCaseId: null,
            schemeEnrollments: [
                {
                    schemeId: tbSupportScheme._id,
                    schemeName: tbSupportScheme.schemeName,
                    recommendationReason:
                        "Demo recommendation based on tuberculosis category.",
                    schemeStatus: "recommended",
                    registeredAt: null,
                },
            ],
        });

        const patientGeeta = await Patient.create({
            fullName: "Geeta Patel",
            age: 35,
            gender: "female",
            phoneNumber: "9000000005",
            address: "Navapura, Demo District",
            areaId: navapuraArea._id,
            assignedWorkerId: ashaWorker2._id,
            healthCategories: ["pregnancy"],
            visitStatus: "appointment_scheduled",
            lastVisitDate: daysFromNow(-4),
            nextVisitDate: daysFromNow(4),
            currentCaseId: null,
            schemeEnrollments: [],
        });

        const patientImran = await Patient.create({
            fullName: "Imran Sheikh",
            age: 48,
            gender: "male",
            phoneNumber: "9000000006",
            address: "Navapura, Demo District",
            areaId: navapuraArea._id,
            assignedWorkerId: ashaWorker2._id,
            healthCategories: ["diabetes", "blood_pressure"],
            visitStatus: "verified",
            lastVisitDate: daysFromNow(-7),
            nextVisitDate: daysFromNow(20),
            currentCaseId: null,
            schemeEnrollments: [],
        });

        const patient7 = await Patient.create({
            fullName: "Lata Parmar",
            age: 24,
            gender: "female",
            phoneNumber: "9000000007",
            address: "Rampur, Demo District",
            areaId: rampurArea._id,
            assignedWorkerId: ashaWorker1._id,
            healthCategories: ["pregnancy"],
            visitStatus: "not_visited",
            lastVisitDate: null,
            nextVisitDate: daysFromNow(5),
            currentCaseId: null,
            schemeEnrollments: [],
        });

        const patient8 = await Patient.create({
            fullName: "Devendra Solanki",
            age: 57,
            gender: "male",
            phoneNumber: "9000000008",
            address: "Shantinagar, Demo District",
            areaId: shantinagarArea._id,
            assignedWorkerId: ashaWorker1._id,
            healthCategories: ["blood_pressure", "diabetes"],
            visitStatus: "screening_completed",
            lastVisitDate: daysFromNow(-1),
            nextVisitDate: daysFromNow(14),
            currentCaseId: null,
            schemeEnrollments: [],
        });

        const patient9 = await Patient.create({
            fullName: "Farida Bano",
            age: 42,
            gender: "female",
            phoneNumber: "9000000009",
            address: "Navapura, Demo District",
            areaId: navapuraArea._id,
            assignedWorkerId: ashaWorker2._id,
            healthCategories: ["tuberculosis"],
            visitStatus: "visit_due",
            lastVisitDate: daysFromNow(-30),
            nextVisitDate: daysFromNow(1),
            currentCaseId: null,
            schemeEnrollments: [],
        });

        const patient10 = await Patient.create({
            fullName: "Kiran Joshi",
            age: 39,
            gender: "other",
            phoneNumber: "9000000010",
            address: "Rampur, Demo District",
            areaId: rampurArea._id,
            assignedWorkerId: ashaWorker1._id,
            healthCategories: ["diabetes"],
            visitStatus: "appointment_scheduled",
            lastVisitDate: daysFromNow(-6),
            nextVisitDate: daysFromNow(6),
            currentCaseId: null,
            schemeEnrollments: [],
        });

        const sunitaCareCase = await CareCase.create({
            patientId: patientSunita._id,
            workerId: ashaWorker1._id,
            areaId: rampurArea._id,
            caseType: "pregnancy",
            caseStatus: "follow_up_due",
            screening: {
                symptoms: ["dizziness", "swelling"],
                bloodPressure: { systolic: 150, diastolic: 95 },
                bloodSugarMgDl: null,
                temperatureCelsius: 37,
                weightKg: 58,
                pregnancy: {
                    isPregnant: true,
                    pregnancyWeeks: 30,
                    dangerSigns: ["swelling"],
                },
                tuberculosis: {
                    coughDurationWeeks: null,
                    feverPresent: false,
                    nightSweatsPresent: false,
                    weightLossPresent: false,
                },
                notes: "Demo pregnancy screening.",
                completedAt: daysFromNow(-3),
            },
            riskAssessment: {
                riskLevel: "red",
                riskScore: 82,
                riskReasons: [
                    "High-risk demo screening finding",
                    "Requires medical review",
                ],
                recommendedAction: "urgent_referral",
                assessedAt: daysFromNow(-3),
            },
            referral: {
                isRequired: true,
                referralStatus: "created",
                facilityName: "District Community Hospital",
                referralReason: "High-risk screening result",
                referredAt: daysFromNow(-3),
            },
            appointment: {
                appointmentStatus: "scheduled",
                hospitalName: "District Community Hospital",
                appointmentDate: daysFromNow(0),
                appointmentTime: "10:30",
                appointmentNotes: "Bring previous health records.",
            },
            followUp: {
                followUpStatus: "due",
                dueDate: daysFromNow(2),
                completedAt: null,
                patientVisitedHospital: null,
                followUpNotes: "",
            },
            proof: {
                proofStatus: "not_uploaded",
                fileUrl: "",
                fileName: "",
                uploadedAt: null,
                verificationMessage: "",
                verifiedAt: null,
            },
        });

        const mohanCareCase = await CareCase.create({
            patientId: patientMohan._id,
            workerId: ashaWorker1._id,
            areaId: shantinagarArea._id,
            caseType: "tuberculosis",
            caseStatus: "referral_pending",
            screening: {
                symptoms: ["persistent cough", "fatigue"],
                bloodPressure: { systolic: 128, diastolic: 82 },
                bloodSugarMgDl: null,
                temperatureCelsius: 37.6,
                weightKg: 54,
                pregnancy: {},
                tuberculosis: {
                    coughDurationWeeks: 3,
                    feverPresent: true,
                    nightSweatsPresent: true,
                    weightLossPresent: false,
                },
                notes: "Demo tuberculosis screening; medical review required.",
                completedAt: daysFromNow(-2),
            },
            riskAssessment: {
                riskLevel: "yellow",
                riskScore: 60,
                riskReasons: ["Demo screening findings require review"],
                recommendedAction: "doctor_visit",
                assessedAt: daysFromNow(-2),
            },
            referral: {
                isRequired: true,
                referralStatus: "recommended",
                facilityName: "",
                referralReason: "Further evaluation recommended",
                referredAt: daysFromNow(-2),
            },
        });

        const ashaCareCase = await CareCase.create({
            patientId: patientAsha._id,
            workerId: ashaWorker1._id,
            areaId: shantinagarArea._id,
            caseType: "diabetes",
            caseStatus: "verification_pending",
            screening: {
                symptoms: ["fatigue"],
                bloodPressure: { systolic: 132, diastolic: 84 },
                bloodSugarMgDl: 168,
                temperatureCelsius: 36.8,
                weightKg: 64,
                pregnancy: {},
                tuberculosis: {},
                notes: "Demo diabetes screening.",
                completedAt: daysFromNow(-5),
            },
            riskAssessment: {
                riskLevel: "yellow",
                riskScore: 55,
                riskReasons: ["Demo screening result requires review"],
                recommendedAction: "doctor_visit",
                assessedAt: daysFromNow(-5),
            },
            referral: {
                isRequired: true,
                referralStatus: "created",
                facilityName: "District Community Hospital",
                referralReason: "Medical review requested",
                referredAt: daysFromNow(-5),
            },
            appointment: {
                appointmentStatus: "visited",
                hospitalName: "District Community Hospital",
                appointmentDate: daysFromNow(-3),
                appointmentTime: "11:00",
                appointmentNotes: "Demo visit completed.",
            },
            followUp: {
                followUpStatus: "completed",
                dueDate: daysFromNow(-2),
                completedAt: daysFromNow(-1),
                patientVisitedHospital: true,
                followUpNotes: "Demo follow-up completed.",
            },
            proof: {
                proofStatus: "uploaded",
                fileUrl: "/uploads/demo-prescription.jpg",
                fileName: "demo-prescription.jpg",
                uploadedAt: daysFromNow(-1),
                verificationMessage: "",
                verifiedAt: null,
            },
        });

        const imranCareCase = await CareCase.create({
            patientId: patientImran._id,
            workerId: ashaWorker2._id,
            areaId: navapuraArea._id,
            caseType: "diabetes",
            caseStatus: "verified",
            screening: {
                symptoms: ["increased thirst"],
                bloodPressure: { systolic: 138, diastolic: 88 },
                bloodSugarMgDl: 174,
                temperatureCelsius: 36.9,
                weightKg: 72,
                pregnancy: {},
                tuberculosis: {},
                notes: "Demo chronic care screening.",
                completedAt: daysFromNow(-7),
            },
            riskAssessment: {
                riskLevel: "yellow",
                riskScore: 50,
                riskReasons: ["Demo screening result requires review"],
                recommendedAction: "doctor_visit",
                assessedAt: daysFromNow(-7),
            },
            referral: {
                isRequired: true,
                referralStatus: "created",
                facilityName: "District Community Hospital",
                referralReason: "Medical review requested",
                referredAt: daysFromNow(-7),
            },
            appointment: {
                appointmentStatus: "visited",
                hospitalName: "District Community Hospital",
                appointmentDate: daysFromNow(-5),
                appointmentTime: "09:45",
                appointmentNotes: "Demo hospital visit completed.",
            },
            followUp: {
                followUpStatus: "completed",
                dueDate: daysFromNow(-3),
                completedAt: daysFromNow(-2),
                patientVisitedHospital: true,
                followUpNotes: "Demo follow-up completed.",
            },
            proof: {
                proofStatus: "verified",
                fileUrl: "/uploads/demo-proof-imran.jpg",
                fileName: "demo-proof-imran.jpg",
                uploadedAt: daysFromNow(-2),
                verificationMessage: "Hospital visit proof verified",
                verifiedAt: daysFromNow(-1),
            },
        });

        patientSunita.currentCaseId = sunitaCareCase._id;
        patientMohan.currentCaseId = mohanCareCase._id;
        patientAsha.currentCaseId = ashaCareCase._id;
        patientImran.currentCaseId = imranCareCase._id;

        patientSunita.schemeEnrollments[0].schemeStatus = "registered";
        patientSunita.schemeEnrollments[0].registeredAt = daysFromNow(-1);

        await patientSunita.save();
        await patientMohan.save();
        await patientAsha.save();
        await patientImran.save();

        const rewardTransactions = await RewardTransaction.create([
            {
                workerId: ashaWorker2._id,
                patientId: patientImran._id,
                caseId: imranCareCase._id,
                actionType: "hospital_visit_verified",
                points: 10,
                description: "Hospital visit successfully verified",
            },
            {
                workerId: ashaWorker2._id,
                patientId: patientImran._id,
                caseId: imranCareCase._id,
                actionType: "follow_up_completed",
                points: 5,
                description: "Follow-up successfully completed",
            },
            {
                workerId: ashaWorker1._id,
                patientId: patientSunita._id,
                caseId: null,
                actionType: "scheme_registered",
                points: 15,
                description: "Demo scheme registration completed",
            },
        ]);

        const calculateWorkerPoints = async (workerId) => {
            const transactions = await RewardTransaction.find({ workerId });
            return transactions.reduce(
                (total, transaction) => total + transaction.points,
                0
            );
        };

        ashaWorker1.totalPoints = await calculateWorkerPoints(ashaWorker1._id);
        ashaWorker2.totalPoints = await calculateWorkerPoints(ashaWorker2._id);
        await ashaWorker1.save();
        await ashaWorker2.save();

        const patients = [
            patientSunita,
            patientRamesh,
            patientAsha,
            patientMohan,
            patientGeeta,
            patientImran,
            patient7,
            patient8,
            patient9,
            patient10,
        ];

        console.log("\nAshaCare database seeded successfully.\n");
        console.log("Demo login:");
        console.log("ASHA Worker:");
        console.log("Phone: 9876543210");
        console.log("Password: 123456\n");
        console.log("Supervisor:");
        console.log("Phone: 9876543299");
        console.log("Password: 123456\n");
        console.log("Created:");
        console.log("3 users");
        console.log("3 areas");
        console.log(`${patients.length} patients`);
        console.log("3 schemes");
        console.log("4 care cases");
        console.log(`${rewardTransactions.length} reward transactions\n`);
        console.log(`ASHA Worker 1 ID: ${ashaWorker1._id}`);
        console.log(`Rampur Area ID: ${rampurArea._id}`);
        console.log(`Sunita Patient ID: ${patientSunita._id}`);
        console.log(`Sunita CareCase ID: ${sunitaCareCase._id}`);

        await mongoose.connection.close();
    } catch (error) {
        console.error("AshaCare database seed failed:", error);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        process.exitCode = 1;
    }
};

seedDatabase();
