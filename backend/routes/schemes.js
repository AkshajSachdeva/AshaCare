import { Router } from 'express';
import { Patient, Scheme, SchemeEnrollment } from '../models/index.js';
import { auth } from '../middleware/auth.js';
import { awardOnce } from '../services/rewards.js';

const router = Router();
router.use(auth);

const gujaratLocationHints = [
  'gujarat', 'anand', 'nadiad', 'kheda', 'vasad', 'karamsad', 'lambhvel',
  'vallabh vidyanagar', 'mogri', 'bakrol', 'jitodia', 'gana', 'chikhodra',
  'boriavi', 'ajarpura', 'sarsa', 'ahmedabad', 'vadodara', 'surat', 'rajkot'
];
const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

function resolveState(location, schemes) {
  const normalized = String(location || '').toLowerCase();
  const configuredStates = [...new Set([...indianStates, ...schemes.flatMap(scheme => scheme.applicableStates || [])])];
  const exact = configuredStates.find(state => normalized.includes(state.toLowerCase()));
  if (exact) return exact;
  if (gujaratLocationHints.some(hint => normalized.includes(hint))) return 'Gujarat';
  return '';
}

function matchesDisease(scheme, patient) {
  const rules = scheme.eligibilityRules || {};
  return (!rules.gender || rules.gender === patient.gender) &&
    (!rules.categories?.length || rules.categories.some(category => patient.healthCategories.includes(category)));
}

function matchesLocation(scheme, state) {
  return scheme.governmentLevel === 'central' || (state && scheme.applicableStates.includes(state));
}

const canAccess = (user, patient) => user.role === 'supervisor' ||
  String(patient.assignedWorkerId?._id || patient.assignedWorkerId) === String(user._id);

router.get('/', async (req, res) => {
  const schemes = await Scheme.find().sort({ governmentLevel:1, schemeName:1 });
  res.json({ success:true, message:'Schemes loaded', data:{ schemes } });
});

router.get('/recommended/:patientId', async (req, res) => {
  const patient = await Patient.findById(req.params.patientId).populate('assignedWorkerId', 'assignedRegion');
  if (!patient || !canAccess(req.user, patient)) return res.status(404).json({ success:false, message:'Beneficiary not found' });

  const allSchemes = await Scheme.find();
  const workerLocation = patient.assignedWorkerId?.assignedRegion || req.user.assignedRegion || '';
  const resolvedState = resolveState(workerLocation, allSchemes);
  const recommended = allSchemes
    .filter(scheme => matchesDisease(scheme, patient) && matchesLocation(scheme, resolvedState))
    .sort((left, right) => left.governmentLevel.localeCompare(right.governmentLevel) || left.schemeName.localeCompare(right.schemeName));
  const enrollments = await SchemeEnrollment.find({ patientId:patient._id });

  res.json({
    success:true,
    message:'Location-aware recommendations loaded',
    data:{
      location:{ label:workerLocation, state:resolvedState },
      schemes:recommended.map(scheme => ({
        ...scheme.toObject(),
        matchedCategories:scheme.eligibilityRules?.categories?.length
          ? scheme.eligibilityRules.categories.filter(category => patient.healthCategories.includes(category))
          : patient.healthCategories,
        enrollment:enrollments.find(item => String(item.schemeId) === String(scheme._id)) || null
      }))
    }
  });
});

router.post('/:schemeId/enroll', async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.body.patientId);
    if (!patient || !canAccess(req.user, patient)) return res.status(404).json({ success:false, message:'Beneficiary not found' });
    let enrollment = await SchemeEnrollment.findOne({ patientId:patient._id, schemeId:req.params.schemeId });
    if (!enrollment) enrollment = await SchemeEnrollment.create({ patientId:patient._id, schemeId:req.params.schemeId, workerId:req.user._id });
    res.status(201).json({ success:true, message:'Registration started', data:{ enrollment } });
  } catch (error) { next(error); }
});

router.patch('/enrollments/:id', async (req, res, next) => {
  try {
    const enrollment = await SchemeEnrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success:false, message:'Enrollment not found' });
    if (req.body.status === 'registered') {
      enrollment.status = 'registered';
      enrollment.registeredAt ||= new Date();
    }
    await enrollment.save();
    let awarded = false;
    if (enrollment.status === 'registered') {
      ({ awarded } = await awardOnce({
        workerId:req.user._id,
        patientId:enrollment.patientId,
        actionType:'scheme_registered',
        relatedId:enrollment._id,
        description:'Scheme registration verified'
      }));
    }
    res.json({
      success:true,
      message:awarded ? 'Registration confirmed. 10 points awarded.' : 'Status saved; no duplicate points awarded.',
      data:{ enrollment, awarded }
    });
  } catch (error) { next(error); }
});

export default router;
