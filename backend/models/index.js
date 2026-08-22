import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  fullName: { type: String, required: true, trim: true }, phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true }, passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['asha_worker', 'supervisor'], default: 'asha_worker' }, preferredLanguage: { type: String, enum: ['en','hi','gu','mr'], default: 'en' },
  totalPoints: { type: Number, default: 0 }, assignedRegion: { type: String, default: 'Anand Rural' }
}, { timestamps: true });

const patientSchema = new Schema({
  fullName: { type: String, required: true }, age: { type: Number, required: true, min: 0, max: 120 }, gender: { type: String, enum: ['male','female','other'], required: true },
  phoneNumber: String, address: String, village: String, healthCategories: [{ type: String, enum: ['pregnancy','blood_pressure','diabetes','tuberculosis','general'] }],
  assignedWorkerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, lastVisitDate: Date, nextFollowUpDate: Date,
  currentRiskLevel: { type: String, enum: ['red','yellow','green'], default: 'green' }, isDemo: { type: Boolean, default: false }
}, { timestamps: true });

const careCaseSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true }, workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  screening: Schema.Types.Mixed, riskLevel: { type: String, enum: ['red','yellow','green'] }, riskScore: Number, riskReasons: [String], advice: [String],
  doctorVisitWithinDays: Number, followUpAfterDays: Number, followUpDueDate: Date,
  doctorVisited: { type: Boolean, default: false }, followUpNotes: String,
  proof: { filename: String, originalName: String, mimeType: String, size: Number, verifiedAt: Date }
}, { timestamps: true });

const schemeSchema = new Schema({
  schemeName: { type: String, required: true, unique: true }, description: String, benefits: [String], eligibilityText: String,
  eligibilityRules: Schema.Types.Mixed, requiredDocuments: [String], sourceUrl: String, registrationUrl: String, sourceName: String,
  lastVerifiedAt: Date, categories: [String]
}, { timestamps: true });

const enrollmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true }, schemeId: { type: Schema.Types.ObjectId, ref: 'Scheme', required: true }, workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['registration_started','registered'], default: 'registration_started' }, registeredAt: Date
}, { timestamps: true });
enrollmentSchema.index({ patientId: 1, schemeId: 1 }, { unique: true });

const rewardSchema = new Schema({
  workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  actionType: { type: String, enum: ['scheme_registered','doctor_visit_verified'], required: true }, relatedId: { type: Schema.Types.ObjectId, required: true },
  points: { type: Number, default: 10 }, description: String
}, { timestamps: true });
rewardSchema.index({ workerId: 1, actionType: 1, relatedId: 1 }, { unique: true });

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, title: String, message: String,
  category: { type: String, enum: ['patient_task','government_update'] }, type: String, relatedId: Schema.Types.ObjectId, isRead: { type: Boolean, default: false }, sourceUrl: String
}, { timestamps: true });

const policySchema = new Schema({ title: String, summary: String, sourceUrl: String, sourceName: String, publishedAt: Date, type: String, verified: { type: Boolean, default: true } }, { timestamps: true });

export const User = model('User', userSchema);
export const Patient = model('Patient', patientSchema);
export const CareCase = model('CareCase', careCaseSchema);
export const Scheme = model('Scheme', schemeSchema);
export const SchemeEnrollment = model('SchemeEnrollment', enrollmentSchema);
export const RewardTransaction = model('RewardTransaction', rewardSchema);
export const Notification = model('Notification', notificationSchema);
export const PolicyUpdate = model('PolicyUpdate', policySchema);

