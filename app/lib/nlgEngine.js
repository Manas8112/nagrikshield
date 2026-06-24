// NagrikShield - Natural Language Generation Engine
// Template-based description generation without any API

import { CATEGORIES } from './seedData';

const SEVERITY_ADJECTIVES = {
  critical: ['extremely dangerous', 'life-threatening', 'catastrophic', 'critical emergency'],
  high: ['severe', 'significant', 'urgent', 'hazardous'],
  medium: ['moderate', 'notable', 'concerning', 'noticeable'],
  low: ['minor', 'small', 'slight', 'early-stage'],
};

const CATEGORY_DETAILS = {
  pothole: {
    actions: ['poses risk to vehicles and pedestrians', 'could cause tire damage and accidents', 'makes the road unsafe for two-wheelers'],
    contexts: ['especially dangerous during rain when it fills with water', 'worsening due to heavy vehicle traffic', 'visible vehicle swerving pattern in the area'],
  },
  water_leak: {
    actions: ['is causing significant water wastage', 'has created waterlogging on the road', 'could damage nearby building foundations'],
    contexts: ['the leak appears to be from a main pipeline', 'contaminated water may pose health risks', 'nearby residents report low water pressure'],
  },
  garbage: {
    actions: ['is attracting stray animals and pests', 'creates unsanitary conditions for residents', 'blocks pedestrian movement on the sidewalk'],
    contexts: ['foul odor spreading to nearby homes', 'includes potentially hazardous waste materials', 'regular garbage collection seems disrupted'],
  },
  streetlight: {
    actions: ['makes the area extremely unsafe after dark', 'increases risk of accidents and crime', 'affects visibility for drivers and pedestrians'],
    contexts: ['multiple lights affected in the stretch', 'exposed wiring noticed near the pole', 'area has reported safety incidents recently'],
  },
  damage: {
    actions: ['poses structural collapse risk', 'creates a tripping hazard for pedestrians', 'may worsen with rain or vibrations'],
    contexts: ['visible cracks widening over time', 'load-bearing elements appear compromised', 'debris partially blocking the pathway'],
  },
  other: {
    actions: ['affects daily life of nearby residents', 'requires attention from municipal authorities', 'could worsen if not addressed promptly'],
    contexts: ['multiple residents have raised concerns', 'issue persisting for an extended period', 'similar issues reported in nearby areas'],
  },
};

export function generateDescription(issue) {
  const sevLevel = issue.severity >= 8.5 ? 'critical' : issue.severity >= 7 ? 'high' : issue.severity >= 5 ? 'medium' : 'low';
  const adjectives = SEVERITY_ADJECTIVES[sevLevel];
  const details = CATEGORY_DETAILS[issue.category] || CATEGORY_DETAILS.other;
  const cat = CATEGORIES[issue.category?.toUpperCase()] || CATEGORIES.OTHER;
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const action = details.actions[Math.floor(Math.random() * details.actions.length)];
  const context = details.contexts[Math.floor(Math.random() * details.contexts.length)];
  
  const landmark = issue.landmark || 'the reported location';
  const area = issue.area ? `${issue.area.value} ${issue.area.unit}` : 'the surrounding area';
  
  return `A ${adj} ${cat.label.toLowerCase()} issue has been identified near ${landmark}. The issue ${action}. ${capitalize(context)}. The affected area spans approximately ${area}. Recommended priority: ${sevLevel.toUpperCase()}.`;
}

export function generateTitle(category, landmark) {
  const titles = {
    pothole: [`Road damage near ${landmark}`, `Pothole reported at ${landmark}`, `Dangerous road surface at ${landmark}`],
    water_leak: [`Water leak detected near ${landmark}`, `Pipeline issue at ${landmark}`, `Water flooding at ${landmark}`],
    garbage: [`Waste accumulation near ${landmark}`, `Garbage dumping at ${landmark}`, `Unsanitary conditions at ${landmark}`],
    streetlight: [`Lighting issue at ${landmark}`, `Dark stretch near ${landmark}`, `Electrical hazard at ${landmark}`],
    damage: [`Infrastructure damage at ${landmark}`, `Structural issue near ${landmark}`, `Safety hazard at ${landmark}`],
    other: [`Community issue near ${landmark}`, `Problem reported at ${landmark}`],
  };
  
  const options = titles[category] || titles.other;
  return options[Math.floor(Math.random() * options.length)];
}

export function generateHealthSummary(vitals, neighborhood) {
  const avg = (vitals.infrastructure + vitals.safety + vitals.cleanliness + vitals.responseSpeed) / 4;
  
  let status, recommendation;
  if (avg >= 80) {
    status = `${neighborhood} is in excellent health! All vital signs are above threshold.`;
    recommendation = 'Continue community vigilance to maintain these standards.';
  } else if (avg >= 60) {
    status = `${neighborhood} shows moderate health with some areas needing attention.`;
    const weakest = Object.entries(vitals).sort((a, b) => a[1] - b[1])[0];
    recommendation = `Focus on improving ${formatVitalName(weakest[0])} which is currently at ${weakest[1]}%.`;
  } else if (avg >= 40) {
    status = `${neighborhood} needs significant improvement across multiple indicators.`;
    recommendation = 'Community action and increased reporting is crucial to drive improvements.';
  } else {
    status = `️ ${neighborhood} is in critical condition! Multiple vital signs are dangerously low.`;
    recommendation = 'Urgent community mobilization and authority engagement needed immediately.';
  }
  
  return { status, recommendation, overallScore: Math.round(avg) };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatVitalName(key) {
  const names = {
    infrastructure: 'Infrastructure Health',
    safety: 'Safety Index',
    cleanliness: 'Cleanliness Score',
    responseSpeed: 'Response Speed',
  };
  return names[key] || key;
}

export default { generateDescription, generateTitle, generateHealthSummary };
