import { Router } from 'express';
import { Patient, CareCase } from '../models/index.js';
import { auth } from '../middleware/auth.js';
const router=Router(); router.use(auth);
router.get('/',async(req,res)=>{ const query=req.user.role==='supervisor'?{}:{assignedWorkerId:req.user._id}; if(req.query.risk)query.currentRiskLevel=req.query.risk; if(req.query.search)query.$or=['fullName','village','phoneNumber'].map(k=>({[k]:{$regex:req.query.search,$options:'i'}})); const patients=await Patient.find(query).sort({nextFollowUpDate:1}); res.json({success:true,message:'Patients loaded',data:{patients}}); });
router.post('/',async(req,res,next)=>{ try { const patient=await Patient.create({...req.body,assignedWorkerId:req.user._id,isDemo:false}); res.status(201).json({success:true,message:'Patient added',data:{patient}}); }catch(e){next(e);} });
router.get('/:id',async(req,res)=>{ const patient=await Patient.findById(req.params.id); if(!patient)return res.status(404).json({success:false,message:'Patient not found'}); const cases=await CareCase.find({patientId:patient._id}).sort({createdAt:-1}); res.json({success:true,message:'Patient loaded',data:{patient,cases}}); });
export default router;

