import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const pendingOtps = new Map();
const DEMO_OTP = '123456';
const normalizeAshaId = value => value?.trim().toUpperCase();
const maskPhone = value => `••••••${String(value).slice(-4)}`;
const view = user => ({
  id: user._id,
  ashaId: user.ashaId,
  fullName: user.fullName,
  phoneNumber: user.phoneNumber,
  email: user.email,
  role: user.role,
  preferredLanguage: user.preferredLanguage,
  totalPoints: user.totalPoints,
  assignedRegion: user.assignedRegion,
  profilePhoto: user.profilePhoto || '',
});
const token = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'ashacare-local-development-secret', { expiresIn: '7d' });

router.post('/signup', async (req, res, next) => {
  try {
    const { fullName, phoneNumber, email, password, preferredLanguage = 'en' } = req.body;
    const ashaId = normalizeAshaId(req.body.ashaId);
    if (!fullName || !ashaId || !phoneNumber || !email || !password) return res.status(400).json({ success: false, message: 'All required fields must be completed' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    const user = await User.create({ fullName, ashaId, phoneNumber, email, passwordHash: await bcrypt.hash(password, 10), preferredLanguage });
    res.status(201).json({ success: true, message: 'Account created', data: { authToken: token(user), currentUser: view(user) } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email or phone number already registered' });
    next(error);
  }
});

router.post('/request-otp', async (req, res, next) => {
  try {
    const ashaId = normalizeAshaId(req.body.ashaId);
    const user = await User.findOne({ ashaId });
    if (!user) return res.status(404).json({ success: false, message: 'ASHA ID not found' });
    pendingOtps.set(ashaId, { otp: DEMO_OTP, expiresAt: Date.now() + 5 * 60 * 1000 });
    res.json({ success: true, message: 'OTP sent', data: { ashaId, maskedPhone: maskPhone(user.phoneNumber), demoOtp: DEMO_OTP, expiresInSeconds: 300 } });
  } catch (error) { next(error); }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const ashaId = normalizeAshaId(req.body.ashaId);
    const pending = pendingOtps.get(ashaId);
    if (!pending || pending.expiresAt < Date.now() || String(req.body.otp) !== pending.otp) return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    const user = await User.findOne({ ashaId });
    if (!user) return res.status(404).json({ success: false, message: 'ASHA ID not found' });
    pendingOtps.delete(ashaId);
    res.json({ success: true, message: 'Welcome back', data: { authToken: token(user), currentUser: view(user) } });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+passwordHash');
    if (!user || !await bcrypt.compare(req.body.password || '', user.passwordHash)) return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    res.json({ success: true, message: 'Welcome back', data: { authToken: token(user), currentUser: view(user) } });
  } catch (error) { next(error); }
});

router.get('/me', auth, (req, res) => res.json({ success: true, message: 'Profile loaded', data: { currentUser: view(req.user) } }));

router.patch('/me', auth, async (req, res) => {
  const allowed = ['preferredLanguage', 'profilePhoto', 'assignedRegion'];
  if (req.body.assignedRegion !== undefined && (!req.body.assignedRegion.trim() || req.body.assignedRegion.trim().length > 120)) {
    return res.status(400).json({ success:false, message:'Location must be between 1 and 120 characters' });
  }
  allowed.forEach(key => { if (req.body[key] !== undefined) req.user[key] = req.body[key]; });
  await req.user.save();
  res.json({ success: true, message: 'Profile updated', data: { currentUser: view(req.user) } });
});

export default router;
