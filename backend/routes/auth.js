import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { auth } from '../middleware/auth.js';
const router = Router();
const view = u => ({ id:u._id, fullName:u.fullName, phoneNumber:u.phoneNumber, email:u.email, role:u.role, preferredLanguage:u.preferredLanguage, totalPoints:u.totalPoints, assignedRegion:u.assignedRegion });
const token = u => jwt.sign({ id:u._id }, process.env.JWT_SECRET || 'ashacare-local-development-secret', { expiresIn:'7d' });
router.post('/signup', async(req,res,next)=>{ try { const {fullName,phoneNumber,email,password,preferredLanguage='en'}=req.body; if(!fullName||!phoneNumber||!email||!password) return res.status(400).json({success:false,message:'All required fields must be completed'}); if(password.length<8) return res.status(400).json({success:false,message:'Password must be at least 8 characters'}); const user=await User.create({fullName,phoneNumber,email,passwordHash:await bcrypt.hash(password,10),preferredLanguage}); res.status(201).json({success:true,message:'Account created',data:{authToken:token(user),currentUser:view(user)}}); } catch(e){ if(e.code===11000)return res.status(409).json({success:false,message:'Email or phone number already registered'}); next(e); }});
router.post('/login', async(req,res,next)=>{ try { const user=await User.findOne({email:req.body.email?.toLowerCase()}).select('+passwordHash'); if(!user||!await bcrypt.compare(req.body.password||'',user.passwordHash)) return res.status(401).json({success:false,message:'Incorrect email or password'}); res.json({success:true,message:'Welcome back',data:{authToken:token(user),currentUser:view(user)}}); } catch(e){next(e);} });
router.get('/me',auth,(req,res)=>res.json({success:true,message:'Profile loaded',data:{currentUser:view(req.user)}}));
router.patch('/me',auth,async(req,res)=>{ const allowed=['preferredLanguage']; allowed.forEach(k=>{if(req.body[k]!==undefined)req.user[k]=req.body[k]}); await req.user.save(); res.json({success:true,message:'Profile updated',data:{currentUser:view(req.user)}}); });
export default router;

