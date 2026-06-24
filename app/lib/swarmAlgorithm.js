// NagrikShield - Swarm Intelligence Validation Algorithm
// Bio-inspired confidence scoring using proximity, credibility, and freshness

export function calculateSwarmConfidence(validators, issueLocation, allUsers) {
  if (!validators || validators.length === 0) return 0;
  
  const DECAY_FACTOR = 2.0; // km
  const FRESHNESS_HALFLIFE = 12; // hours
  
  let totalSignal = 0;
  
  validators.forEach(validation => {
    const user = allUsers.find(u => u.id === validation.userId) || {};
    
    // Proximity score: e^(-distance/decay)
    const distance = validation.distance || getRandomProximity(issueLocation);
    const proximityScore = Math.exp(-distance / DECAY_FACTOR);
    
    // Credibility score: based on past accuracy and level
    const accuracy = user.accuracy || 0.5;
    const level = user.level || 1;
    const credibilityScore = accuracy * (1 + level / 30);
    
    // Freshness score: e^(-hours/halflife)
    const hoursSince = validation.hoursSince || 1;
    const freshnessScore = Math.exp(-hoursSince / FRESHNESS_HALFLIFE);
    
    const signal = proximityScore * credibilityScore * freshnessScore;
    totalSignal += signal;
  });
  
  // Normalize to 0-1 range using sigmoid-like function
  const confidence = 1 - Math.exp(-totalSignal / 2);
  return Math.min(0.99, Math.round(confidence * 100) / 100);
}

export function getValidationStatus(confidence) {
  if (confidence >= 0.85) return { status: 'confirmed', label: 'Confirmed', color: '#00ff88' };
  if (confidence >= 0.60) return { status: 'likely', label: 'Likely Valid', color: '#ffaa00' };
  if (confidence >= 0.30) return { status: 'pending', label: 'Needs More Validators', color: '#ff8800' };
  return { status: 'unverified', label: 'Unverified', color: '#64748b' };
}

export function simulateSwarmNodes(validators, issueLocation, allUsers) {
  return validators.map((validatorId, idx) => {
    const user = allUsers.find(u => u.id === validatorId) || {};
    const angle = (idx / validators.length) * Math.PI * 2;
    const distance = 0.3 + Math.random() * 1.5;
    
    return {
      id: validatorId,
      name: user.name || 'Anonymous',
      avatar: user.avatar || '',
      level: user.level || 1,
      accuracy: user.accuracy || 0.5,
      distance: distance,
      angle: angle,
      x: Math.cos(angle) * (1 - distance / 3) * 40 + 50,
      y: Math.sin(angle) * (1 - distance / 3) * 40 + 50,
      proximityScore: Math.exp(-distance / 2),
      credibilityScore: (user.accuracy || 0.5) * (1 + (user.level || 1) / 30),
      signal: 0, // Computed later
    };
  });
}

export function canValidate(userId, issue) {
  if (issue.reportedBy === userId) return false;
  if (issue.validators && issue.validators.includes(userId)) return false;
  if (issue.disputes && issue.disputes.includes(userId)) return false;
  return true;
}

export function addValidation(issue, userId, isDispute = false) {
  const updated = { ...issue };
  if (isDispute) {
    updated.disputes = [...(updated.disputes || []), userId];
  } else {
    updated.validators = [...(updated.validators || []), userId];
  }
  
  // Recalculate confidence
  const totalValidators = (updated.validators || []).length;
  const totalDisputes = (updated.disputes || []).length;
  const total = totalValidators + totalDisputes;
  
  if (total === 0) {
    updated.swarmConfidence = 0;
  } else if (totalDisputes > totalValidators) {
    updated.swarmConfidence = 0.1;
    updated.status = 'disputed';
  } else {
    // Simple confidence boost per validator
    updated.swarmConfidence = Math.min(0.99, 0.4 + (totalValidators * 0.12) - (totalDisputes * 0.15));
  }
  
  // Status updates
  if (updated.swarmConfidence >= 0.85 && updated.status === 'reported') {
    updated.status = 'validated';
  }
  
  return updated;
}

function getRandomProximity() {
  return 0.2 + Math.random() * 2;
}

export default {
  calculateSwarmConfidence,
  getValidationStatus,
  simulateSwarmNodes,
  canValidate,
  addValidation,
};
