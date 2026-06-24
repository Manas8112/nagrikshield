// NagrikShield - Quest & Achievement Engine

export function checkQuestProgress(quest, userStats, newAction) {
  if (!quest.active) return quest;
  
  const updated = { ...quest };
  
  switch (quest.type) {
    case 'report':
      if (newAction.type === 'report' && (!quest.category || newAction.category === quest.category)) {
        updated.progress = Math.min(updated.target, updated.progress + 1);
      }
      break;
    case 'validate':
      if (newAction.type === 'validate' && (!quest.category || newAction.category === quest.category)) {
        updated.progress = Math.min(updated.target, updated.progress + 1);
      }
      break;
    case 'night_report':
      if (newAction.type === 'report') {
        const hour = new Date().getHours();
        if (hour >= 20 || hour <= 6) {
          updated.progress = Math.min(updated.target, updated.progress + 1);
        }
      }
      break;
    case 'first_validate':
      if (newAction.type === 'validate' && newAction.isFirst) {
        updated.progress = Math.min(updated.target, updated.progress + 1);
      }
      break;
    case 'raid':
      if (newAction.type === 'raid_complete') {
        updated.progress = Math.min(updated.target, updated.progress + 1);
      }
      break;
    case 'streak':
      if (newAction.type === 'report') {
        updated.progress = Math.min(updated.target, (userStats.currentStreak || 0) + 1);
      }
      break;
    default:
      break;
  }
  
  if (updated.progress >= updated.target) {
    updated.completed = true;
    updated.completedAt = new Date().toISOString();
  }
  
  return updated;
}

export function getQuestStatusLabel(quest) {
  if (quest.completed) return { label: 'Completed! ', color: '#00ff88' };
  if (quest.progress > 0) return { label: 'In Progress', color: '#ffaa00' };
  return { label: 'Not Started', color: '#64748b' };
}

export function getQuestProgressPercent(quest) {
  return Math.min(100, Math.round((quest.progress / quest.target) * 100));
}

export function getAvailableQuests(quests) {
  return quests.filter(q => q.active && !q.completed);
}

export function getCompletedQuests(quests) {
  return quests.filter(q => q.completed);
}

export default {
  checkQuestProgress, getQuestStatusLabel,
  getQuestProgressPercent, getAvailableQuests, getCompletedQuests,
};
