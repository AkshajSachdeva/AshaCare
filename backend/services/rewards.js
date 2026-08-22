import { RewardTransaction, User } from '../models/index.js';

export async function awardOnce({ workerId, patientId, actionType, relatedId, description }) {
  try {
    const reward = await RewardTransaction.create({ workerId, patientId, actionType, relatedId, points: 10, description });
    const totals = await RewardTransaction.aggregate([{ $match: { workerId: reward.workerId } }, { $group: { _id: null, total: { $sum: '$points' } } }]);
    await User.findByIdAndUpdate(workerId, { totalPoints: totals[0]?.total || 0 });
    return { reward, awarded: true };
  } catch (error) {
    if (error.code === 11000) return { reward: null, awarded: false };
    throw error;
  }
}

