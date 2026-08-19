const RewardTransaction = require("../models/RewardTransaction");
const User = require("../models/User");

const HOSPITAL_VISIT_VERIFIED_POINTS = 10;
const HOSPITAL_VISIT_VERIFIED_ACTION = "hospital_visit_verified";
const SCHEME_REGISTRATION_POINTS = 15;
const SCHEME_REGISTRATION_ACTION = "scheme_registered";

const findExistingReward = (careCase) =>
    RewardTransaction.findOne({
        workerId: careCase.workerId,
        caseId: careCase._id,
        actionType: HOSPITAL_VISIT_VERIFIED_ACTION,
    });

const awardHospitalVisitReward = async (careCase) => {
    const existingReward = await findExistingReward(careCase);

    if (existingReward) {
        return {
            created: false,
            rewardTransaction: existingReward,
        };
    }

    let rewardTransaction;

    try {
        rewardTransaction = await RewardTransaction.create({
            workerId: careCase.workerId,
            patientId: careCase.patientId,
            caseId: careCase._id,
            actionType: HOSPITAL_VISIT_VERIFIED_ACTION,
            points: HOSPITAL_VISIT_VERIFIED_POINTS,
            description: "Hospital visit verified",
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateReward = await findExistingReward(careCase);

            return {
                created: false,
                rewardTransaction: duplicateReward,
            };
        }

        throw error;
    }

    try {
        const worker = await User.findByIdAndUpdate(
            careCase.workerId,
            { $inc: { totalPoints: HOSPITAL_VISIT_VERIFIED_POINTS } },
            { new: true }
        );

        if (!worker) {
            throw new Error("Care case worker was not found");
        }
    } catch (error) {
        await RewardTransaction.deleteOne({ _id: rewardTransaction._id });
        throw error;
    }

    return {
        created: true,
        rewardTransaction,
    };
};

const rollbackHospitalVisitReward = async (rewardTransaction) => {
    await User.findByIdAndUpdate(rewardTransaction.workerId, {
        $inc: { totalPoints: -rewardTransaction.points },
    });
    await RewardTransaction.deleteOne({ _id: rewardTransaction._id });
};

const findExistingSchemeRegistrationReward = (workerId, patientId) =>
    RewardTransaction.findOne({
        workerId,
        patientId,
        actionType: SCHEME_REGISTRATION_ACTION,
    });

const awardSchemeRegistrationReward = async (workerId, patientId) => {
    const existingReward = await findExistingSchemeRegistrationReward(
        workerId,
        patientId
    );

    if (existingReward) {
        return {
            created: false,
            rewardTransaction: existingReward,
        };
    }

    let rewardTransaction;

    try {
        rewardTransaction = await RewardTransaction.create({
            workerId,
            patientId,
            caseId: null,
            actionType: SCHEME_REGISTRATION_ACTION,
            points: SCHEME_REGISTRATION_POINTS,
            description: "Scheme registration completed",
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateReward = await findExistingSchemeRegistrationReward(
                workerId,
                patientId
            );

            return {
                created: false,
                rewardTransaction: duplicateReward,
            };
        }

        throw error;
    }

    try {
        const worker = await User.findByIdAndUpdate(
            workerId,
            { $inc: { totalPoints: SCHEME_REGISTRATION_POINTS } },
            { new: true }
        );

        if (!worker) {
            throw new Error("Scheme worker was not found");
        }
    } catch (error) {
        await RewardTransaction.deleteOne({ _id: rewardTransaction._id });
        throw error;
    }

    return {
        created: true,
        rewardTransaction,
    };
};

const rollbackSchemeRegistrationReward = async (rewardTransaction) => {
    await User.findByIdAndUpdate(rewardTransaction.workerId, {
        $inc: { totalPoints: -rewardTransaction.points },
    });
    await RewardTransaction.deleteOne({ _id: rewardTransaction._id });
};

module.exports = {
    HOSPITAL_VISIT_VERIFIED_POINTS,
    awardHospitalVisitReward,
    rollbackHospitalVisitReward,
    SCHEME_REGISTRATION_POINTS,
    awardSchemeRegistrationReward,
    rollbackSchemeRegistrationReward,
};
