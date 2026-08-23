import { Router } from 'express';
import { User, Patient, CareCase, SchemeEnrollment } from '../models/index.js';
import { auth, supervisorOnly } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res) => {
  const patientQuery = req.user.role === 'supervisor' ? {} : { assignedWorkerId: req.user._id };
  const caseQuery = req.user.role === 'supervisor' ? {} : { workerId: req.user._id };
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [patients, cases] = await Promise.all([
    Patient.find(patientQuery),
    CareCase.find({ ...caseQuery, followUpDueDate: { $gte: monthStart, $lt: monthEnd } }).populate('patientId'),
  ]);

  // Use the live Patient records—the same source as the Patients tab—for calendar risk.
  const patientById = new Map(patients.map(patient => [String(patient._id), patient]));
  const calendar = {};
  for (const careCase of cases) {
    const patient = patientById.get(String(careCase.patientId?._id || careCase.patientId));
    const key = careCase.followUpDueDate.toISOString().slice(0, 10);
    calendar[key] ??= { visits: 0, followUps: 0, patients: [] };
    calendar[key].followUps++;
    calendar[key].visits++;
    calendar[key].patients.push({
      id: patient?._id,
      name: patient?.fullName || careCase.patientId?.fullName || 'Beneficiary',
      riskLevel: patient?.currentRiskLevel || 'green',
    });
  }

  const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12).toISOString().slice(0, 10);

  res.json({
    success: true,
    message: 'Dashboard loaded',
    data: {
      stats: {
        visitsToday: calendar[todayKey]?.visits || 0,
        highRisk: patients.filter(patient => patient.currentRiskLevel === 'red').length,
        followUpsDue: patients.filter(patient => patient.nextFollowUpDate <= new Date(now.getTime() + 86400000)).length,
        totalPoints: req.user.totalPoints,
      },
      calendar,
    },
  });
});

router.get('/supervisor', supervisorOnly, async (_req, res) => {
  const [workers, patients, highRisk, followUpsDue, schemeRegistrations, verifiedDoctorVisits, leaderboard] = await Promise.all([
    User.countDocuments({ role: 'asha_worker' }),
    Patient.countDocuments(),
    Patient.countDocuments({ currentRiskLevel: 'red' }),
    Patient.countDocuments({ nextFollowUpDate: { $lte: new Date() } }),
    SchemeEnrollment.countDocuments({ status: 'registered' }),
    CareCase.countDocuments({ 'proof.verifiedAt': { $exists: true } }),
    User.find({ role: 'asha_worker' }).select('fullName totalPoints').sort({ totalPoints: -1 }),
  ]);
  res.json({
    success: true,
    message: 'Supervisor dashboard loaded',
    data: { workers, patients, highRisk, followUpsDue, schemeRegistrations, verifiedDoctorVisits, leaderboard },
  });
});

export default router;
