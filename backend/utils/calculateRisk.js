export function calculateRisk(input = {}) {
  const reasons = [];
  let score = 0;
  const systolic = Number(input.systolic || 0);
  const diastolic = Number(input.diastolic || 0);
  const temperature = Number(input.temperature || 0);
  const sugar = Number(input.bloodSugar || 0);
  const coughDays = Number(input.coughDuration || 0);
  const dangerSigns = Array.isArray(input.dangerSigns) ? input.dangerSigns : [];
  if (systolic >= 180 || diastolic >= 120) { score += 6; reasons.push('Severely elevated blood-pressure reading'); }
  else if (systolic >= 140 || diastolic >= 90) { score += 3; reasons.push('Elevated blood-pressure reading'); }
  if (temperature >= 39) { score += 4; reasons.push('High temperature'); } else if (temperature >= 38) { score += 2; reasons.push('Raised temperature'); }
  if (sugar >= 300) { score += 5; reasons.push('Very high blood-sugar reading'); } else if (sugar >= 200) { score += 3; reasons.push('High blood-sugar reading'); }
  if (coughDays >= 14) { score += 3; reasons.push('Cough lasting two weeks or more'); }
  if (input.nightSweats) { score += 2; reasons.push('Night sweats reported'); }
  if (input.weightLoss) { score += 2; reasons.push('Weight loss reported'); }
  if (dangerSigns.length) { score += 6; reasons.push('Pregnancy danger sign reported'); }
  if (Array.isArray(input.symptoms) && input.symptoms.length >= 3) { score += 2; reasons.push('Multiple symptoms reported'); }
  const riskLevel = score >= 6 ? 'red' : score >= 3 ? 'yellow' : 'green';
  const details = {
    red: { doctorVisitWithinDays: 1, followUpAfterDays: 2, advice: ['Seek qualified medical care urgently', 'Watch for worsening symptoms and use emergency services if needed'] },
    yellow: { doctorVisitWithinDays: 3, followUpAfterDays: 4, advice: ['Arrange a doctor consultation soon', 'Continue medicines only as prescribed and monitor symptoms'] },
    green: { doctorVisitWithinDays: 7, followUpAfterDays: 7, advice: ['Continue routine care and monitoring', 'Maintain medicines as prescribed'] }
  }[riskLevel];
  return { riskLevel, riskScore: score, riskReasons: reasons.length ? reasons : ['No high-risk screening indicators recorded'], ...details };
}

