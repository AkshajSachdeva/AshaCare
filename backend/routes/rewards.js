import { Router } from 'express';
import { RewardTransaction, User } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res) => {
  const leaderboard = await User.find({ role: 'asha_worker' })
    .select('fullName totalPoints assignedRegion profilePhoto')
    .sort({ totalPoints: -1, fullName: 1 });
  const transactionQuery = RewardTransaction.find({ workerId: req.user._id }).sort({ createdAt: -1 });
  if (req.query.all !== 'true') transactionQuery.limit(20);
  const transactions = await transactionQuery;
  const rank = leaderboard.findIndex(worker => String(worker._id) === String(req.user._id)) + 1;

  res.json({
    success: true,
    message: 'Rewards loaded',
    data: {
      totalPoints: req.user.totalPoints,
      transactions,
      leaderboard: leaderboard.map((worker, index) => ({ ...worker.toObject(), rank: index + 1 })),
      rank: rank || null,
      modelLabel: 'AshaCare incentive allocation model — hackathon demo',
    },
  });
});

export default router;
