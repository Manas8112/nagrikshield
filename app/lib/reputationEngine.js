// NagrikShield - Reputation & Staking Engine

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Scout', icon: '' },
  { level: 2, xp: 100, title: 'Scout', icon: '' },
  { level: 3, xp: 250, title: 'Scout', icon: '' },
  { level: 4, xp: 450, title: 'Scout', icon: '' },
  { level: 5, xp: 700, title: 'Scout', icon: '' },
  { level: 6, xp: 1000, title: 'Ranger', icon: '️' },
  { level: 7, xp: 1350, title: 'Ranger', icon: '️' },
  { level: 8, xp: 1750, title: 'Ranger', icon: '️' },
  { level: 9, xp: 2200, title: 'Ranger', icon: '️' },
  { level: 10, xp: 2700, title: 'Ranger', icon: '️' },
  { level: 11, xp: 3250, title: 'Guardian', icon: '️' },
  { level: 12, xp: 3850, title: 'Guardian', icon: '️' },
  { level: 13, xp: 4500, title: 'Guardian', icon: '️' },
  { level: 14, xp: 5200, title: 'Guardian', icon: '️' },
  { level: 15, xp: 5950, title: 'Guardian', icon: '️' },
  { level: 16, xp: 6750, title: 'Champion', icon: '' },
  { level: 17, xp: 7600, title: 'Champion', icon: '' },
  { level: 18, xp: 8500, title: 'Champion', icon: '' },
  { level: 19, xp: 9450, title: 'Champion', icon: '' },
  { level: 20, xp: 10450, title: 'Champion', icon: '' },
  { level: 21, xp: 11500, title: 'Legend', icon: '⭐' },
  { level: 22, xp: 12600, title: 'Legend', icon: '⭐' },
  { level: 23, xp: 13750, title: 'Legend', icon: '⭐' },
  { level: 24, xp: 14950, title: 'Legend', icon: '⭐' },
  { level: 25, xp: 16200, title: 'Legend', icon: '⭐' },
];

const XP_REWARDS = {
  report_issue: 50,
  validate_issue: 20,
  first_validate: 40,
  issue_resolved: 100,
  stake_correct: 30,
  stake_wrong: -15,
  daily_login: 10,
  quest_complete: 0, // varies per quest
};

const POINT_REWARDS = {
  report_issue: 10,
  validate_issue: 5,
  first_validate: 10,
  issue_resolved: 25,
};

export function getLevelInfo(xp) {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1];
  
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] || { ...current, xp: current.xp + 1500, level: current.level + 1 };
      break;
    }
  }
  
  const xpInLevel = xp - current.xp;
  const xpNeeded = next.xp - current.xp;
  const progress = Math.min(1, xpInLevel / xpNeeded);
  
  return {
    level: current.level,
    title: current.title,
    icon: current.icon,
    xp,
    xpInLevel,
    xpNeeded,
    progress,
    nextLevel: next.level,
    nextTitle: next.title,
    currentLevel: current,
    nextLevelObj: next,
  };
}

export function calculateStakeReturn(stakeAmount, issueResolved, issueValid) {
  if (issueResolved && issueValid) {
    return { amount: stakeAmount * 2, multiplier: '2x', type: 'win' };
  } else if (!issueValid) {
    return { amount: -stakeAmount, multiplier: '-1x', type: 'loss' };
  }
  return { amount: stakeAmount, multiplier: '1x', type: 'pending' };
}

export function getXPForAction(action) {
  return XP_REWARDS[action] || 0;
}

export function getPointsForAction(action) {
  return POINT_REWARDS[action] || 0;
}

export function getRankSuffix(rank) {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
}

export function sortUsersByRank(users) {
  return [...users].sort((a, b) => {
    if (b.shieldPoints !== a.shieldPoints) return b.shieldPoints - a.shieldPoints;
    if (b.xp !== a.xp) return b.xp - a.xp;
    return b.issuesReported - a.issuesReported;
  });
}

export default {
  getLevelInfo, calculateStakeReturn, getXPForAction,
  getPointsForAction, getRankSuffix, sortUsersByRank,
  LEVEL_THRESHOLDS, XP_REWARDS,
};
