import bcrypt from 'bcryptjs';
import { User, Patient, CareCase, Scheme, SchemeEnrollment, RewardTransaction, Notification, PolicyUpdate } from './models/index.js';

const day = (offset, hour = 9) => { const d = new Date(); d.setHours(hour,0,0,0); d.setDate(d.getDate()+offset); return d; };

export async function seedDatabase() {
  if (await User.exists({})) return;
  const passwordHash = await bcrypt.hash('Demo@123', 10);
  const [asha, asha2, supervisor] = await User.create([
    { fullName:'Meera Patel', phoneNumber:'9000000001', email:'asha@demo.in', passwordHash, assignedRegion:'Anand Rural', totalPoints:20 },
    { fullName:'Kavita Joshi', phoneNumber:'9000000002', email:'kavita@demo.in', passwordHash, assignedRegion:'Nadiad Rural', totalPoints:10 },
    { fullName:'Dr. Riya Shah', phoneNumber:'9000000099', email:'supervisor@demo.in', passwordHash, role:'supervisor', assignedRegion:'Kheda District' }
  ]);
  const names = [
    ['Sunita Devi',28,'female','pregnancy','yellow','Karamsad',1],['Ramesh Patel',61,'male','blood_pressure','red','Vallabh Vidyanagar',0],
    ['Amina Shaikh',47,'female','diabetes','yellow','Mogri',2],['Leela Ben',35,'female','general','green','Bakrol',4],
    ['Vijay Kumar',39,'male','tuberculosis','yellow','Lambhvel',-1],['Rekha Parmar',24,'female','pregnancy','green','Jitodia',6],
    ['Mohan Desai',67,'male','blood_pressure','yellow','Gana',3],['Fatima Bano',31,'female','general','green','Chikhodra',7],
    ['Kiran Solanki',52,'other','diabetes','red','Vasad',0],['Nisha Rathod',22,'female','pregnancy','green','Ajarpura',5],
    ['Bhavesh Rana',44,'male','general','green','Sarsa',8],['Geeta Chauhan',58,'female','blood_pressure','yellow','Boriavi',1]
  ];
  const patients = await Patient.create(names.map((n,i)=>({ fullName:n[0], age:n[1], gender:n[2], phoneNumber:`98765000${String(i).padStart(2,'0')}`, address:`House ${i+1}, Main Road`, village:n[5], healthCategories:[n[3]], assignedWorkerId:i<9?asha._id:asha2._id, currentRiskLevel:n[4], nextFollowUpDate:day(n[6]), lastVisitDate:day(-i-1), isDemo:true })));
  const schemes = await Scheme.create([
    { schemeName:'Janani Suraksha Yojana (JSY)', description:'Safe motherhood intervention promoting institutional delivery among eligible pregnant women.', benefits:['Cash assistance linked to institutional delivery and post-delivery care'], eligibilityText:'Eligibility varies by state performance category and BPL/SC/ST status. Confirm on the official source.', eligibilityRules:{ categories:['pregnancy'], gender:'female' }, requiredDocuments:['Identity proof','Bank details','Pregnancy/ANC record','Eligibility certificate where applicable'], sourceUrl:'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309', registrationUrl:'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309', sourceName:'National Health Mission, Government of India', lastVerifiedAt:new Date('2026-08-22'), categories:['pregnancy'] },
    { schemeName:'Janani Shishu Suraksha Karyakram (JSSK)', description:'Free entitlements at public health institutions for pregnant women and sick infants.', benefits:['Free and cashless delivery including C-section','Free drugs, diagnostics, diet, blood and eligible transport'], eligibilityText:'Pregnant women using public health institutions; benefits also cover eligible sick infants. Confirm locally.', eligibilityRules:{ categories:['pregnancy'], gender:'female' }, requiredDocuments:['Identity proof','Pregnancy/health record'], sourceUrl:'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=308', registrationUrl:'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=308', sourceName:'National Health Mission, Government of India', lastVerifiedAt:new Date('2026-08-22'), categories:['pregnancy','general'] },
    { schemeName:'Pradhan Mantri Matru Vandana Yojana (PMMVY)', description:'Maternity benefit support for eligible pregnant and lactating women from disadvantaged sections.', benefits:['Conditional maternity cash benefit through direct bank transfer'], eligibilityText:'Covers specified socially/economically disadvantaged categories; benefit rules depend on child order and current guidelines.', eligibilityRules:{ categories:['pregnancy'], gender:'female' }, requiredDocuments:['Aadhaar','Aadhaar-linked bank account','Mobile number','MCP/RCHI card'], sourceUrl:'https://www.spniwcd.wcd.gov.in/pradhan-mantri-matru-vandana-yojna/faqs', registrationUrl:'https://pmmvy.wcd.gov.in/', sourceName:'Ministry of Women and Child Development, Government of India', lastVerifiedAt:new Date('2026-08-22'), categories:['pregnancy'] }
  ]);
  const cases = await CareCase.create(patients.slice(0,7).map((p,i)=>({ patientId:p._id, workerId:p.assignedWorkerId, screening:{ notes:'Seeded demo screening' }, riskLevel:p.currentRiskLevel, riskScore:p.currentRiskLevel==='red'?7:p.currentRiskLevel==='yellow'?4:1, riskReasons:['Demo clinical screening record'], advice:['Continue clinician-directed care and monitoring'], doctorVisitWithinDays:p.currentRiskLevel==='red'?1:3, followUpAfterDays:i%3+2, followUpDueDate:p.nextFollowUpDate })));
  const enrollment = await SchemeEnrollment.create({ patientId:patients[0]._id, schemeId:schemes[0]._id, workerId:asha._id, status:'registered', registeredAt:day(-4) });
  const verifiedCase = cases[1]; verifiedCase.doctorVisited=true; verifiedCase.proof={ filename:'seed-proof.pdf', originalName:'doctor-note.pdf', mimeType:'application/pdf', size:1024, verifiedAt:day(-2) }; await verifiedCase.save();
  await RewardTransaction.create([
    { workerId:asha._id, patientId:patients[0]._id, actionType:'scheme_registered', relatedId:enrollment._id, points:10, description:'JSY registration verified' },
    { workerId:asha._id, patientId:patients[1]._id, actionType:'doctor_visit_verified', relatedId:verifiedCase._id, points:10, description:'Doctor visit proof verified' }
  ]);
  const policies = await PolicyUpdate.create([
    { title:'Review PMMVY 2.0 eligibility guidance', summary:'Official PMMVY FAQs describe current coverage and registration requirements. Verify each patient against the latest portal guidance.', sourceUrl:'https://www.spniwcd.wcd.gov.in/pradhan-mantri-matru-vandana-yojna/faqs', sourceName:'Ministry of Women and Child Development', publishedAt:new Date('2026-08-01'), type:'scheme_update' },
    { title:'JSSK entitlement reference', summary:'NHM guidance lists free maternal and infant care entitlements at public health institutions.', sourceUrl:'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=308', sourceName:'National Health Mission', publishedAt:new Date('2026-08-06'), type:'policy_reference' }
  ]);
  await Notification.create([
    { userId:asha._id,title:'Follow-up due today',message:`Follow up with ${patients[1].fullName} today.`,category:'patient_task',type:'follow_up_due',relatedId:patients[1]._id },
    { userId:asha._id,title:'Follow-up overdue',message:`Follow up with ${patients[4].fullName}; this task is overdue.`,category:'patient_task',type:'follow_up_overdue',relatedId:patients[4]._id },
    ...policies.map(p=>({ userId:asha._id,title:p.title,message:p.summary,category:'government_update',type:p.type,relatedId:p._id,sourceUrl:p.sourceUrl }))
  ]);
}

