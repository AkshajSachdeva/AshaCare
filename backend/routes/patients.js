import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { Patient, CareCase, SchemeEnrollment, RewardTransaction, Notification, User } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const uploadDir = path.resolve('uploads');
router.use(auth);

const canAccess = (user, patient) => user.role === 'supervisor' || String(patient.assignedWorkerId) === String(user._id);
const followUpDays = { red:7, yellow:21, green:42 };
const indiaDate = offsetDays => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en', {
    timeZone:'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit'
  }).formatToParts(new Date()).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + offsetDays));
  return date.toISOString().slice(0, 10);
};

router.get('/', async (req, res) => {
  const query = req.user.role === 'supervisor' ? {} : { assignedWorkerId: req.user._id };
  if (req.query.risk) query.currentRiskLevel = req.query.risk;
  if (req.query.search) query.$or = ['fullName','village','phoneNumber'].map(key => ({ [key]: { $regex:req.query.search, $options:'i' } }));
  const patients = await Patient.find(query).sort({ nextFollowUpDate:1 });
  res.json({ success:true, message:'Beneficiaries loaded', data:{ patients } });
});

router.post('/', async (req, res, next) => {
  try {
    if (req.body.piiConsent !== true) return res.status(400).json({ success:false, message:'Beneficiary consent is required before personal information can be saved' });
    const risk = req.body.currentRiskLevel;
    const followUpDate = req.body.nextFollowUpDate;
    if (!Object.hasOwn(followUpDays, risk)) return res.status(400).json({ success:false, message:'Choose a valid beneficiary risk level' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(followUpDate || '')) return res.status(400).json({ success:false, message:'Choose a follow-up date' });
    const earliest = indiaDate(0);
    const latest = indiaDate(followUpDays[risk]);
    if (followUpDate < earliest || followUpDate > latest) {
      return res.status(400).json({ success:false, message:`Follow-up for ${risk} risk must be between today and ${latest}` });
    }
    const patient = await Patient.create({ ...req.body, piiConsent:true, piiConsentAt:new Date(), assignedWorkerId:req.user._id, isDemo:false });
    res.status(201).json({ success:true, message:'Beneficiary added', data:{ patient } });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient || !canAccess(req.user, patient)) return res.status(404).json({ success:false, message:'Beneficiary not found' });
  const cases = await CareCase.find({ patientId:patient._id }).sort({ createdAt:-1 });
  res.json({ success:true, message:'Beneficiary loaded', data:{ patient, cases } });
});

router.delete('/:id', async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || !canAccess(req.user, patient)) return res.status(404).json({ success:false, message:'Beneficiary not found' });

    const cases = await CareCase.find({ patientId:patient._id });
    const caseIds = cases.map(item => item._id);
    const workerIds = [...new Set((await RewardTransaction.find({ patientId:patient._id }).select('workerId')).map(item => String(item.workerId)))];

    await Promise.all([
      CareCase.deleteMany({ patientId:patient._id }),
      SchemeEnrollment.deleteMany({ patientId:patient._id }),
      RewardTransaction.deleteMany({ patientId:patient._id }),
      Notification.deleteMany({ relatedId:{ $in:[patient._id, ...caseIds] } }),
      Patient.deleteOne({ _id:patient._id })
    ]);

    await Promise.all(workerIds.map(async workerId => {
      const remaining = await RewardTransaction.find({ workerId }).select('points');
      await User.updateOne({ _id:workerId }, { $set:{ totalPoints:remaining.reduce((sum,item) => sum + item.points, 0) } });
    }));

    await Promise.allSettled(cases.map(async item => {
      if (!item.proof?.filename) return;
      const filePath = path.resolve(uploadDir, item.proof.filename);
      if (path.dirname(filePath) === uploadDir) await fs.unlink(filePath);
    }));

    res.json({ success:true, message:'Beneficiary and linked personal data permanently deleted', data:{ deleted:true } });
  } catch (error) { next(error); }
});

export default router;
