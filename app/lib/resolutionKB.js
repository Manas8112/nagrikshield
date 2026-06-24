// NagrikShield - Resolution Knowledge Base
// 100+ resolution templates organized by category × severity

const RESOLUTIONS = {
  pothole: {
    low: {
      steps: [
        'Document the pothole with clear photos from multiple angles',
        'Mark the area with chalk or paint to warn other road users',
        'Report to your local ward office or BBMP helpline (1533)',
        'Follow up via the BBMP Sahaya app if no response within 7 days',
      ],
      department: 'Public Works Department (PWD) / BBMP Roads',
      estimatedCost: '₹2,000 - ₹5,000',
      estimatedTime: '3-7 working days',
      helplineNumbers: ['BBMP: 1533', 'PWD: 080-22374700'],
      draftComplaint: 'Respected Sir/Madam,\n\nI wish to bring to your notice a pothole located at {location}. The pothole measures approximately {area} and poses a risk to commuters. I request immediate repair action.\n\nPhotographic evidence is attached for your reference.\n\nThank you,\n{reporter_name}\nWard: {ward}\nDate: {date}',
    },
    medium: {
      steps: [
        'Document with photos and video showing the scale of damage',
        'Place temporary warning markers if safe to do so',
        'File complaint with BBMP (1533) and your area MLA office',
        'Tag @ABORBBMP on Twitter/X with photos for faster response',
        'Follow up every 3 days until resolved',
      ],
      department: 'BBMP Roads Division + Ward Engineer',
      estimatedCost: '₹5,000 - ₹15,000',
      estimatedTime: '5-14 working days',
      helplineNumbers: ['BBMP: 1533', 'Ward Office: Check BBMP website'],
      draftComplaint: 'Respected Sir/Madam,\n\nI am writing to report a significant pothole on {location} that requires urgent attention. The pothole is approximately {area} in size and has already caused damage to vehicles. Multiple residents have expressed concern.\n\nThis issue affects the daily commute of hundreds of citizens and poses a safety hazard, especially during monsoon season.\n\nI request immediate inspection and repair within 7 days.\n\nPhotographic evidence and location coordinates are attached.\n\nThank you,\n{reporter_name}\nDate: {date}',
    },
    high: {
      steps: [
        'IMMEDIATE: Place barricades or large visible markers around the pothole',
        'File URGENT complaint with BBMP Emergency Cell',
        'Contact your area corporator directly with photographic evidence',
        'File an RTI application if no response within 3 days',
        'Contact local media if pothole has caused accidents',
        'Document all vehicle damages for potential claims',
      ],
      department: 'BBMP Emergency Cell + Traffic Police',
      estimatedCost: '₹15,000 - ₹50,000',
      estimatedTime: '24-72 hours (emergency repair)',
      helplineNumbers: ['BBMP Emergency: 1533', 'Traffic Police: 080-22943000', 'MLA Office'],
      draftComplaint: 'URGENT COMPLAINT\n\nRespected Sir/Madam,\n\nI am reporting a DANGEROUS pothole at {location} that poses immediate risk to life and property. The pothole is {area} in size and has already caused accidents.\n\nThis is an EMERGENCY requiring immediate action within 24 hours. Failure to act may result in serious injuries.\n\nI request:\n1. Immediate barricading of the area\n2. Emergency road repair within 48 hours\n3. Compensation mechanism for affected vehicles\n\nPhotographic and video evidence attached.\n\n{reporter_name}\nDate: {date}',
    },
    critical: {
      steps: [
        'EMERGENCY: Call 112 if pothole has caused an accident',
        'Barricade the entire area to prevent more incidents',
        'Call BBMP Emergency + Traffic Police simultaneously',
        'Alert nearby hospitals if injuries are involved',
        'Contact media outlets immediately',
        'File police report if accidents have occurred',
        'Document everything for legal proceedings',
      ],
      department: 'BBMP Emergency Cell + Police + Traffic Control',
      estimatedCost: '₹50,000+',
      estimatedTime: 'Immediate response required',
      helplineNumbers: ['Emergency: 112', 'BBMP: 1533', 'Police: 100', 'Ambulance: 108'],
      draftComplaint: ' EMERGENCY COMPLAINT \n\nSir/Madam,\n\nA LIFE-THREATENING road hazard exists at {location}. A massive pothole/road cave-in of {area} has caused/is likely to cause serious accidents.\n\nIMMEDIATE ACTION REQUIRED:\n- Road barricading\n- Emergency repair crew deployment\n- Traffic diversion\n\nThis notice serves as formal documentation. Any delay in response resulting in injury will be subject to legal action under relevant municipal laws.\n\n{reporter_name}\nDate: {date}\nTime: {time}',
    },
  },
  water_leak: {
    low: { steps: ['Report to BWSSB helpline (1916)', 'Document the leak location precisely', 'Notify neighbors to reduce water usage', 'Follow up in 3 days'], department: 'BWSSB (Bangalore Water Supply & Sewerage Board)', estimatedCost: '₹3,000 - ₹8,000', estimatedTime: '3-7 days', helplineNumbers: ['BWSSB: 1916'], draftComplaint: 'Respected Sir/Madam,\n\nA water leak has been detected at {location}. The leak appears minor but is causing water wastage. Kindly arrange for repair.\n\n{reporter_name}\nDate: {date}' },
    medium: { steps: ['Call BWSSB emergency (1916) immediately', 'Mark the leak area with visible markers', 'Alert nearby residents to conserve water', 'Contact your ward engineer directly', 'File complaint on BWSSB website with photos'], department: 'BWSSB + Ward Engineer', estimatedCost: '₹8,000 - ₹25,000', estimatedTime: '2-5 days', helplineNumbers: ['BWSSB: 1916', 'Ward Engineer'], draftComplaint: 'Respected Sir/Madam,\n\nA significant water leak has been detected at {location}, causing road damage and water wastage of approximately {area}. The leak has been ongoing and requires urgent repair.\n\n{reporter_name}\nDate: {date}' },
    high: { steps: ['URGENT: Call BWSSB emergency immediately', 'Block the affected area if possible', 'Alert BESCOM if water is near electrical installations', 'Contact local corporator for fast-tracking', 'Document water wastage for public accountability'], department: 'BWSSB Emergency + BESCOM (if electrical risk)', estimatedCost: '₹25,000 - ₹1,00,000', estimatedTime: '24-48 hours', helplineNumbers: ['BWSSB: 1916', 'BESCOM: 1912', 'Emergency: 112'], draftComplaint: 'URGENT: Major water pipeline burst at {location}. Road flooding and potential electrical hazard. Immediate repair team needed.\n\n{reporter_name}\nDate: {date}' },
    critical: { steps: ['EMERGENCY: Call 112 + BWSSB simultaneously', 'Evacuate area if structural damage risk exists', 'Alert BESCOM to cut power to nearby installations', 'Contact all emergency services', 'Block traffic in the area'], department: 'All Emergency Services', estimatedCost: '₹1,00,000+', estimatedTime: 'Immediate', helplineNumbers: ['Emergency: 112', 'BWSSB: 1916', 'BESCOM: 1912', 'Fire: 101'], draftComplaint: ' EMERGENCY: Catastrophic water main failure at {location}. Immediate threat to nearby structures and electrical systems. All emergency services required NOW.\n\n{reporter_name}\nDate: {date}' },
  },
  garbage: {
    low: { steps: ['Report to BBMP solid waste management helpline', 'Contact your area pourakarmika', 'Use BBMP Sahaya app to log complaint', 'Organize community cleanup if feasible'], department: 'BBMP Solid Waste Management', estimatedCost: '₹1,000 - ₹3,000', estimatedTime: '2-5 days', helplineNumbers: ['BBMP: 1533'], draftComplaint: 'Sir/Madam,\n\nGarbage accumulation reported at {location}. Please arrange for cleanup.\n\n{reporter_name}' },
    medium: { steps: ['File complaint with BBMP SWM division', 'Contact your area Health Inspector', 'Report on BBMP Sahaya app with photos', 'Rally neighbors to sign a joint complaint', 'Contact local corporator'], department: 'BBMP SWM + Health Department', estimatedCost: '₹3,000 - ₹10,000', estimatedTime: '3-7 days', helplineNumbers: ['BBMP: 1533', 'Health Dept'], draftComplaint: 'Sir/Madam,\n\nSignificant garbage accumulation at {location} affecting {area}. Health hazard to residents. Immediate cleanup requested.\n\n{reporter_name}' },
    high: { steps: ['File urgent complaint with BBMP SWM', 'Report health hazard to District Health Officer', 'Contact Pollution Control Board if toxic waste', 'Alert media for public pressure', 'Organize community protest if long-standing'], department: 'BBMP SWM + Pollution Control + Health Dept', estimatedCost: '₹10,000 - ₹30,000', estimatedTime: '24-72 hours', helplineNumbers: ['BBMP: 1533', 'Pollution Board: 080-25586520'], draftComplaint: 'URGENT: Hazardous waste dumping at {location}. Immediate health risk to community. Demanding action within 24 hours.\n\n{reporter_name}' },
    critical: { steps: ['Call 112 if toxic/medical waste involved', 'Contact Pollution Control Board emergency line', 'Alert District Health Officer', 'Evacuate area if bio-hazard present', 'Contact media immediately'], department: 'Emergency Services + Pollution Control', estimatedCost: '₹30,000+', estimatedTime: 'Immediate', helplineNumbers: ['Emergency: 112', 'Pollution Board', 'Health Dept'], draftComplaint: ' HAZARDOUS WASTE EMERGENCY at {location}. Bio-hazard / toxic material present. Immediate containment and cleanup required.\n\n{reporter_name}' },
  },
  streetlight: {
    low: { steps: ['Report to BESCOM helpline (1912)', 'Note the pole number for reference', 'Log complaint on BESCOM app', 'Follow up in 5 days'], department: 'BESCOM (Bangalore Electricity Supply Company)', estimatedCost: '₹1,500 - ₹5,000', estimatedTime: '3-7 days', helplineNumbers: ['BESCOM: 1912'], draftComplaint: 'Sir/Madam,\n\nStreetlight not functioning at {location}. Pole number: ___. Please arrange for repair.\n\n{reporter_name}' },
    medium: { steps: ['Call BESCOM (1912) and note complaint number', 'Report to BBMP street lighting division', 'Contact ward engineer', 'Place reflective markers if possible at night'], department: 'BESCOM + BBMP Street Lighting', estimatedCost: '₹5,000 - ₹15,000', estimatedTime: '2-5 days', helplineNumbers: ['BESCOM: 1912', 'BBMP: 1533'], draftComplaint: 'Sir/Madam,\n\nMultiple streetlights non-functional at {location}. Area very dark and unsafe at night. Please prioritize repair.\n\n{reporter_name}' },
    high: { steps: ['URGENT: Call BESCOM emergency if live wires exposed', 'Alert traffic police about dark stretch', 'Barricade area if electrical hazard exists', 'Contact BESCOM AE directly', 'Alert local police station'], department: 'BESCOM Emergency + Traffic Police', estimatedCost: '₹15,000 - ₹50,000', estimatedTime: '24-48 hours', helplineNumbers: ['BESCOM: 1912', 'Traffic Police: 080-22943000', 'Police: 100'], draftComplaint: 'URGENT: Electrical hazard at {location}. Live wires / fallen pole creating life-threatening situation. Immediate response required.\n\n{reporter_name}' },
    critical: { steps: ['EMERGENCY: Call 112 immediately', 'Keep people away from live wires', 'Call BESCOM to cut power to the area', 'Alert fire services if sparking/fire risk', 'Call ambulance if any injuries'], department: 'All Emergency Services + BESCOM', estimatedCost: '₹50,000+', estimatedTime: 'Immediate', helplineNumbers: ['Emergency: 112', 'BESCOM: 1912', 'Fire: 101', 'Ambulance: 108'], draftComplaint: ' ELECTRICAL EMERGENCY at {location}. Live wires down / transformer fire risk. IMMEDIATE power shutdown and emergency response required.\n\n{reporter_name}' },
  },
  damage: {
    low: { steps: ['Document the damage with photos', 'Report to BBMP building division', 'Inform property owner if identifiable', 'Place warning signs'], department: 'BBMP Building Division', estimatedCost: '₹5,000 - ₹15,000', estimatedTime: '5-14 days', helplineNumbers: ['BBMP: 1533'], draftComplaint: 'Sir/Madam,\n\nInfrastructure damage reported at {location}. Please arrange for inspection and repair.\n\n{reporter_name}' },
    medium: { steps: ['Document thoroughly with photos and video', 'Report to BBMP structural engineering division', 'Alert nearby residents of potential risk', 'Request structural assessment', 'Contact ward engineer'], department: 'BBMP Engineering + Ward Office', estimatedCost: '₹15,000 - ₹50,000', estimatedTime: '3-10 days', helplineNumbers: ['BBMP: 1533', 'Ward Engineer'], draftComplaint: 'Sir/Madam,\n\nSignificant structural damage at {location} requiring professional assessment. Potential safety risk to pedestrians and vehicles.\n\n{reporter_name}' },
    high: { steps: ['Barricade the dangerous area immediately', 'Call BBMP emergency for structural assessment', 'Alert traffic police if road affected', 'Contact building owner for immediate action', 'File formal safety complaint'], department: 'BBMP Emergency + Structural Engineer', estimatedCost: '₹50,000 - ₹2,00,000', estimatedTime: '24-72 hours', helplineNumbers: ['BBMP: 1533', 'Police: 100'], draftComplaint: 'URGENT: Structural damage at {location} posing immediate safety risk. Professional structural assessment and emergency repair required within 24 hours.\n\n{reporter_name}' },
    critical: { steps: ['EMERGENCY: Call 112', 'Evacuate nearby area if collapse risk', 'Call NDRF if major structural failure', 'Alert all emergency services', 'Contact media for public safety'], department: 'All Emergency Services + NDRF', estimatedCost: '₹2,00,000+', estimatedTime: 'Immediate', helplineNumbers: ['Emergency: 112', 'NDRF: 011-24363260', 'Police: 100'], draftComplaint: ' STRUCTURAL EMERGENCY at {location}. Imminent collapse risk. Area evacuation needed. All emergency services required immediately.\n\n{reporter_name}' },
  },
  other: {
    low: { steps: ['Document the issue with photos', 'Report to relevant municipal authority', 'Contact your local ward office'], department: 'BBMP / Relevant Authority', estimatedCost: 'Variable', estimatedTime: '5-14 days', helplineNumbers: ['BBMP: 1533'], draftComplaint: 'Sir/Madam,\n\nI wish to report an issue at {location}. Details attached.\n\n{reporter_name}' },
    medium: { steps: ['Document thoroughly', 'Identify the responsible department', 'File formal complaint with evidence', 'Follow up regularly'], department: 'Relevant Municipal Authority', estimatedCost: 'Variable', estimatedTime: '3-10 days', helplineNumbers: ['BBMP: 1533'], draftComplaint: 'Sir/Madam,\n\nA community issue at {location} requires attention. Please arrange for inspection.\n\n{reporter_name}' },
    high: { steps: ['Document as emergency', 'Contact all relevant authorities', 'Alert community members', 'Contact media if necessary'], department: 'Multiple Departments', estimatedCost: 'Variable', estimatedTime: '24-72 hours', helplineNumbers: ['BBMP: 1533', 'Police: 100'], draftComplaint: 'URGENT: Community emergency at {location}. Immediate multi-department response required.\n\n{reporter_name}' },
    critical: { steps: ['Call 112 immediately', 'Evacuate if safety risk', 'Alert all emergency services'], department: 'All Emergency Services', estimatedCost: 'Variable', estimatedTime: 'Immediate', helplineNumbers: ['Emergency: 112'], draftComplaint: ' EMERGENCY at {location}. Immediate response required from all services.\n\n{reporter_name}' },
  },
};

export function getResolution(category, severity) {
  const severityLevel = severity >= 8.5 ? 'critical' : severity >= 7 ? 'high' : severity >= 5 ? 'medium' : 'low';
  const catResolutions = RESOLUTIONS[category] || RESOLUTIONS.other;
  return catResolutions[severityLevel] || catResolutions.low;
}

export function fillTemplate(template, data) {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '___');
  });
  return result;
}

export function getSeverityLevel(severity) {
  if (severity >= 8.5) return { level: 'critical', label: 'CRITICAL', color: '#ff3366', bg: 'rgba(255, 51, 102, 0.15)' };
  if (severity >= 7) return { level: 'high', label: 'HIGH', color: '#ff8800', bg: 'rgba(255, 136, 0, 0.15)' };
  if (severity >= 5) return { level: 'medium', label: 'MEDIUM', color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.15)' };
  return { level: 'low', label: 'LOW', color: '#00ff88', bg: 'rgba(0, 255, 136, 0.15)' };
}

export function getDynamicSeverity(issue) {
  const baseSeverity = issue.severity || 5.0;
  const upvoteBoost = (issue.upvotes || 0) * 0.15;
  const commentBoost = (issue.comments?.length || 0) * 0.1;
  return Math.min(10.0, baseSeverity + upvoteBoost + commentBoost);
}

export default { getResolution, fillTemplate, getSeverityLevel, getDynamicSeverity };
