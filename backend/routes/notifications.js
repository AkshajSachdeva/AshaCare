import { Router } from 'express';
import { Notification, Patient } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

async function generate(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  const patients = await Patient.find({ assignedWorkerId: userId, nextFollowUpDate: { $lt: end } });
  for (const patient of patients) {
    const overdue = patient.nextFollowUpDate < start;
    await Notification.updateOne(
      { userId, relatedId: patient._id, type: overdue ? 'follow_up_overdue' : 'follow_up_due' },
      { $setOnInsert: {
        title: overdue ? 'Follow-up overdue' : 'Follow-up due soon',
        message: `Follow up with ${patient.fullName}${overdue ? ' as soon as possible.' : ' by tomorrow.'}`,
        category: 'patient_task',
        isRead: false,
      } },
      { upsert: true },
    );
  }
}

router.get('/', async (req, res) => {
  await generate(req.user._id);
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({
    success: true,
    message: 'Notifications loaded',
    data: { notifications, unreadCount: notifications.filter(notification => !notification.isRead).length },
  });
});

router.patch('/:id/read', async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true },
  );
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.json({ success: true, message: 'Notification marked read', data: { notification, unreadCount } });
});

router.patch('/read-all', async (req, res) => {
  await Notification.updateMany({ userId: req.user._id }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked read', data: { unreadCount: 0 } });
});

export default router;
