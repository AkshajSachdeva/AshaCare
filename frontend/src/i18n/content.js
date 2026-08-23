const exactKeys = {
  'Doctor visit proof verified':'doctorProofVerified',
  'Scheme registration verified':'schemeRegistrationVerified',
  'JSY registration verified':'jsyRegistrationVerified',
  'Seek qualified medical care urgently':'seekCareUrgently',
  'Watch for worsening symptoms and use emergency services if needed':'watchWorsening',
  'Arrange a doctor consultation soon':'arrangeConsultation',
  'Continue medicines only as prescribed and monitor symptoms':'continuePrescribedMonitor',
  'Continue routine care and monitoring':'continueRoutineCare',
  'Maintain medicines as prescribed':'maintainMedicines',
  'No high-risk screening indicators recorded':'noRiskIndicators',
  'Demo clinical screening record':'demoClinicalRecord',
  'Continue clinician-directed care and monitoring':'clinicianCare',
  'Review PMMVY 2.0 eligibility guidance':'schemeUpdateTitle',
  'Official PMMVY FAQs describe current coverage and registration requirements. Verify each patient against the latest portal guidance.':'schemeUpdateMessage',
  'JSSK entitlement reference':'policyReferenceTitle',
  'NHM guidance lists free maternal and infant care entitlements at public health institutions.':'policyReferenceMessage',
  'Safe motherhood intervention promoting institutional delivery among eligible pregnant women.':'jsyDescription',
  'Free entitlements at public health institutions for pregnant women and sick infants.':'jsskDescription',
  'Maternity benefit support for eligible pregnant and lactating women from disadvantaged sections.':'pmmvyDescription',
  'National health assurance for eligible families, including cashless secondary and tertiary hospitalization.':'pmjayDescription',
  'Nutrition support through direct benefit transfer for notified tuberculosis patients during treatment.':'nikshayDescription',
  'Gujarat’s integrated PMJAY-MA health assurance scheme for eligible beneficiaries.':'pmjayMaDescription',
  'Gujarat medical assistance for eligible Scheduled Caste beneficiaries within the notified income limits.':'bckMedicalDescription',
  'Eligible families receive cashless hospital care within the current PM-JAY coverage rules':'pmjayBenefit',
  '₹1,000 per month during the treatment period under current central guidance':'nikshayBenefit',
  'Cashless hospitalization under applicable PMJAY-MA coverage and eligibility rules':'pmjayMaBenefit',
  'Condition-based medical assistance, including support for common diseases, serious delivery cases and tuberculosis':'bckMedicalBenefit',
  'Identity proof':'identityProof','Bank details':'bankDetails','Pregnancy/ANC record':'pregnancyRecord','Pregnancy/health record':'pregnancyRecord',
  'Eligibility certificate where applicable':'eligibilityCertificate','Aadhaar':'aadhaar',
  'Aadhaar-linked bank account':'aadhaarBank','Mobile number':'mobileNumber','MCP/RCHI card':'mcpCard',
  'Ration card or family identification where applicable':'familyIdentification','Nikshay registration details':'nikshayRegistration',
  'Caste certificate':'casteCertificate','Income certificate':'incomeCertificate','Medical record':'medicalRecord'
};

export function localizeContent(value,t){
  if(!value)return value;
  const key=exactKeys[value];
  if(key)return t(key);
  let match=value.match(/^Follow up with (.+) today\.$/);if(match)return t('followUpToday',{name:match[1]});
  match=value.match(/^Follow up with (.+) by tomorrow\.$/);if(match)return t('followUpTomorrow',{name:match[1]});
  match=value.match(/^Follow up with (.+) as soon as possible\.$/);if(match)return t('followUpUrgent',{name:match[1]});
  match=value.match(/^Follow up with (.+); this task is overdue\.$/);if(match)return t('followUpTaskOverdue',{name:match[1]});
  match=value.match(/^Patient profile includes (.+)\. Confirm final eligibility on the official source\.$/);if(match)return t('profileIncludes',{categories:match[1].split(', ').map(t).join(', ')});
  match=value.match(/^Beneficiary profile includes (.+)\. Confirm final eligibility on the official source\.$/);if(match)return t('profileIncludes',{categories:match[1].split(', ').map(t).join(', ')});
  return value;
}

export function notificationTitle(notification,t){
  if(notification.type==='follow_up_due')return t('followUpDue');
  if(notification.type==='follow_up_overdue')return t('followUpOverdue');
  return localizeContent(notification.title,t);
}
