import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ashacare-local-development-secret');
    req.user = await User.findById(decoded.id);
    if (!req.user) throw new Error('User not found');
    next();
  } catch { res.status(401).json({ success: false, message: 'Invalid or expired session' }); }
}

export function supervisorOnly(req, res, next) {
  if (req.user.role !== 'supervisor') return res.status(403).json({ success: false, message: 'Supervisor access required' });
  next();
}

