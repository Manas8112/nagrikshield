// NagrikShield - Cascade Prediction Engine
// DAG-based cause-effect chains with probabilities

const CASCADE_TREES = {
  pothole: {
    name: 'Pothole / Road Damage',
    icon: '️',
    consequences: [
      {
        name: 'Road Damage Spreads',
        probability: 0.65,
        timeframe: '2-4 weeks',
        cost: '₹10,000 - ₹25,000',
        icon: '️',
        consequences: [
          { name: 'Vehicle Accidents', probability: 0.40, timeframe: '4-8 weeks', cost: '₹50,000+', icon: '', consequences: [] },
          { name: 'Traffic Congestion', probability: 0.55, timeframe: '1-2 weeks', cost: '₹5,000/day productivity loss', icon: '', consequences: [] },
        ],
      },
      {
        name: 'Water Accumulation',
        probability: 0.50,
        timeframe: '1-2 weeks',
        cost: '₹5,000 - ₹15,000',
        icon: '',
        consequences: [
          { name: 'Mosquito Breeding', probability: 0.70, timeframe: '3-6 weeks', cost: '₹20,000+ (health costs)', icon: '', consequences: [] },
          { name: 'Underground Erosion', probability: 0.25, timeframe: '4-12 weeks', cost: '₹1,00,000+', icon: '️', consequences: [] },
        ],
      },
    ],
  },
  water_leak: {
    name: 'Water Leak / Pipe Burst',
    icon: '',
    consequences: [
      {
        name: 'Road Surface Erosion',
        probability: 0.80,
        timeframe: '1-3 weeks',
        cost: '₹15,000 - ₹40,000',
        icon: '️',
        consequences: [
          { name: 'Pothole Formation', probability: 0.60, timeframe: '2-4 weeks', cost: '₹20,000 - ₹50,000', icon: '️', consequences: [] },
          { name: 'Foundation Damage', probability: 0.20, timeframe: '4-12 weeks', cost: '₹2,00,000+', icon: '', consequences: [] },
        ],
      },
      {
        name: 'Water Wastage',
        probability: 0.95,
        timeframe: 'Immediate',
        cost: '₹500/day',
        icon: '',
        consequences: [
          { name: 'Area Water Shortage', probability: 0.40, timeframe: '2-8 weeks', cost: '₹10,000+ (tanker costs)', icon: '️', consequences: [] },
        ],
      },
      {
        name: 'Electrical Hazard',
        probability: 0.30,
        timeframe: '1-2 weeks',
        cost: '₹25,000 - ₹1,00,000',
        icon: '',
        consequences: [
          { name: 'Short Circuit / Fire Risk', probability: 0.50, timeframe: 'Immediate', cost: '₹5,00,000+', icon: '', consequences: [] },
        ],
      },
    ],
  },
  garbage: {
    name: 'Garbage / Waste Dump',
    icon: '️',
    consequences: [
      {
        name: 'Air Quality Deterioration',
        probability: 0.85,
        timeframe: 'Immediate',
        cost: '₹0 (health impact)',
        icon: '',
        consequences: [
          { name: 'Respiratory Health Issues', probability: 0.45, timeframe: '1-4 weeks', cost: '₹5,000+ per person', icon: '', consequences: [] },
        ],
      },
      {
        name: 'Stray Animal Attraction',
        probability: 0.75,
        timeframe: '1-3 days',
        cost: '₹2,000 - ₹10,000',
        icon: '',
        consequences: [
          { name: 'Dog Bite Incidents', probability: 0.35, timeframe: '1-4 weeks', cost: '₹5,000+ (medical)', icon: '🩹', consequences: [] },
        ],
      },
      {
        name: 'Drain Blockage',
        probability: 0.60,
        timeframe: '2-4 weeks',
        cost: '₹8,000 - ₹20,000',
        icon: '',
        consequences: [
          { name: 'Flooding During Rain', probability: 0.70, timeframe: 'Seasonal', cost: '₹50,000+', icon: '', consequences: [] },
          { name: 'Sewage Overflow', probability: 0.40, timeframe: '4-8 weeks', cost: '₹30,000+', icon: '', consequences: [] },
        ],
      },
    ],
  },
  streetlight: {
    name: 'Streetlight / Electrical Issue',
    icon: '',
    consequences: [
      {
        name: 'Increased Crime Risk',
        probability: 0.55,
        timeframe: 'Immediate',
        cost: 'Immeasurable',
        icon: '',
        consequences: [
          { name: 'Theft / Chain Snatching', probability: 0.30, timeframe: '1-4 weeks', cost: '₹10,000+', icon: '', consequences: [] },
        ],
      },
      {
        name: 'Road Accidents at Night',
        probability: 0.45,
        timeframe: 'Immediate',
        cost: '₹50,000+',
        icon: '',
        consequences: [
          { name: 'Pedestrian Injuries', probability: 0.35, timeframe: '1-4 weeks', cost: '₹20,000+ (medical)', icon: '', consequences: [] },
        ],
      },
      {
        name: 'Electrical Fire Hazard',
        probability: 0.20,
        timeframe: '1-4 weeks',
        cost: '₹1,00,000+',
        icon: '',
        consequences: [],
      },
    ],
  },
  damage: {
    name: 'Infrastructure Damage',
    icon: '️',
    consequences: [
      {
        name: 'Structural Collapse Risk',
        probability: 0.35,
        timeframe: '2-8 weeks',
        cost: '₹5,00,000+',
        icon: '️',
        consequences: [
          { name: 'Injury / Fatality Risk', probability: 0.25, timeframe: 'Unpredictable', cost: 'Immeasurable', icon: '', consequences: [] },
        ],
      },
      {
        name: 'Pedestrian Hazard',
        probability: 0.70,
        timeframe: 'Immediate',
        cost: '₹10,000+',
        icon: '',
        consequences: [
          { name: 'Trip/Fall Injuries', probability: 0.45, timeframe: '1-4 weeks', cost: '₹5,000+ per incident', icon: '🩹', consequences: [] },
        ],
      },
      {
        name: 'Accessibility Blocked',
        probability: 0.60,
        timeframe: 'Immediate',
        cost: '₹0',
        icon: '',
        consequences: [
          { name: 'Emergency Vehicle Delays', probability: 0.20, timeframe: 'Immediate', cost: 'Life-threatening', icon: '', consequences: [] },
        ],
      },
    ],
  },
  other: {
    name: 'Other Issue',
    icon: '️',
    consequences: [
      {
        name: 'Community Disruption',
        probability: 0.50,
        timeframe: '1-2 weeks',
        cost: 'Variable',
        icon: '',
        consequences: [
          { name: 'Quality of Life Impact', probability: 0.60, timeframe: 'Ongoing', cost: 'Variable', icon: '', consequences: [] },
        ],
      },
    ],
  },
};

export function getCascadeTree(category) {
  return CASCADE_TREES[category] || CASCADE_TREES.other;
}

export function flattenCascade(tree, depth = 0, parentProb = 1) {
  const nodes = [];
  if (!tree.consequences) return nodes;
  
  tree.consequences.forEach((c, idx) => {
    const actualProb = parentProb * c.probability;
    nodes.push({
      ...c,
      depth,
      index: idx,
      actualProbability: Math.round(actualProb * 100),
      displayProbability: Math.round(c.probability * 100),
    });
    if (c.consequences && c.consequences.length > 0) {
      nodes.push(...flattenCascade(c, depth + 1, actualProb));
    }
  });
  
  return nodes;
}

export function getTotalCascadeRisk(category) {
  const tree = getCascadeTree(category);
  const flat = flattenCascade(tree);
  const avgProb = flat.reduce((sum, n) => sum + n.actualProbability, 0) / (flat.length || 1);
  return Math.round(avgProb);
}

export function getPreventionSavings(category, severity) {
  const fixNowCosts = {
    pothole: '₹5,000 - ₹15,000',
    water_leak: '₹8,000 - ₹25,000',
    garbage: '₹2,000 - ₹8,000',
    streetlight: '₹3,000 - ₹12,000',
    damage: '₹10,000 - ₹50,000',
    other: '₹5,000 - ₹20,000',
  };
  
  const cascadeCosts = {
    pothole: '₹1,00,000+',
    water_leak: '₹5,00,000+',
    garbage: '₹50,000+',
    streetlight: '₹2,00,000+',
    damage: '₹10,00,000+',
    other: '₹50,000+',
  };
  
  return {
    fixNow: fixNowCosts[category] || fixNowCosts.other,
    ifCascades: cascadeCosts[category] || cascadeCosts.other,
    savingsMultiplier: Math.round(3 + severity * 1.5) + 'x',
  };
}

export default { getCascadeTree, flattenCascade, getTotalCascadeRisk, getPreventionSavings };
