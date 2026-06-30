// NagrikShield - Async Database Client
// 100% Server API persistent storage

const API_BASE = typeof window === 'undefined' ? 'http://127.0.0.1:3000/api/database' : '/api/database';
import { seedData } from './seedData';
import reputationEngine from './reputationEngine';
import questEngine from './questEngine';

async function fetchDb(model) {
  const res = await fetch(`${API_BASE}?model=${model}`);
  if (!res.ok) return [];
  return res.json();
}

async function postDb(model, payload) {
  const res = await fetch(`${API_BASE}?model=${model}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data.data;
}

async function putDb(model, id, payload) {
  const res = await fetch(`${API_BASE}?model=${model}&id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data.data;
}

// Issues CRUD
export async function getIssues() {
  return await fetchDb('issues');
}

export async function getIssueById(id) {
  const issues = await getIssues();
  return issues.find(i => i.id === id) || null;
}

export async function addIssue(issue) {
  return await postDb('issues', issue);
}

export async function updateIssue(id, updates) {
  return await putDb('issues', id, updates);
}

export async function updateIssueStatus(id, newStatus, extraData = {}) {
  const issue = await getIssueById(id);
  if (!issue) return null;
  
  if (!issue.timeline) issue.timeline = [];
  issue.timeline.push({
    action: `status_changed_to_${newStatus}`,
    by: 'admin',
    at: new Date().toISOString(),
    note: extraData.resolutionDescription || extraData.dispatchNote || `System status formally updated to ${newStatus.replace('_', ' ')}`,
    resolutionProof: extraData.proofImage || null
  });
  
  return await updateIssue(id, { status: newStatus, timeline: issue.timeline });
}

export async function addValidation(issueId, userId, isDispute = false) {
  const issue = await getIssueById(issueId);
  if (!issue) return null;

  if (isDispute) {
    if (!issue.disputes) issue.disputes = [];
    if (!issue.disputes.includes(userId)) issue.disputes.push(userId);
  } else {
    if (!issue.validators) issue.validators = [];
    if (!issue.validators.includes(userId)) issue.validators.push(userId);
  }

  const total = (issue.validators?.length || 0) + (issue.disputes?.length || 0);
  if (total > 0) {
    issue.swarmConfidence = (issue.validators?.length || 0) / total;
  }
  
  if (!issue.timeline) issue.timeline = [];
  issue.timeline.push({
    action: isDispute ? 'disputed' : 'validated',
    by: userId,
    at: new Date().toISOString(),
    note: isDispute ? 'User flagged the issue as resolved or fake.' : 'User confirmed the issue is present and dangerous.'
  });
  
  if (issue.swarmConfidence >= 0.8 && (issue.validators?.length || 0) >= 3 && issue.status === 'reported') {
    issue.status = 'validated';
    issue.timeline.push({
      action: 'status_changed_to_validated',
      by: 'system',
      at: new Date().toISOString(),
      note: 'Swarm consensus reached. Govt dispatch required.'
    });
  }

  // Check if this is the first validator and if it completes a raid
  const isFirst = (!issue.validators || issue.validators.length === 1); // it's 1 because we just added it above?
  // Wait, let's see how validators are added. They are pushed to issue.validators.
  // Actually, wait, the user's validation is just added. So if issue.validators didn't exist or is length 1.
  
  // 1. Process User Rewards & Quests
  if (!isDispute) {
    const isFirstValidator = (issue.validators?.length === 1);
    const isRaidComplete = (issue.validators?.length === 10);
    await processUserAction(userId, 'validate_issue', issue.category, { isFirst: isFirstValidator });
    if (isRaidComplete && issue.reportedBy) {
      await processUserAction(issue.reportedBy, 'raid_complete', issue.category);
    }
  }

  return await updateIssue(issueId, issue);
}

export async function addComment(issueId, comment) {
  const issue = await getIssueById(issueId);
  if (!issue) return null;
  if (!issue.comments) issue.comments = [];
  issue.comments.push({ ...comment, id: `c-${Date.now()}`, createdAt: new Date().toISOString() });
  
  // Notify reporter if someone else comments
  if (comment.userId !== issue.reportedBy) {
    const commenter = await getUserById(comment.userId);
    await addNotification(issue.reportedBy, {
      type: 'comment', issueId, message: `${commenter?.name || 'A user'} commented on your report: "${issue.title}"`
    });
  }

  return await updateIssue(issueId, issue);
}

export async function toggleUpvote(issueId, userId) {
  const issue = await getIssueById(issueId);
  if (!issue) return null;
  if (!issue.upvotedBy) issue.upvotedBy = [];
  
  const index = issue.upvotedBy.indexOf(userId);
  if (index === -1) {
    issue.upvotedBy.push(userId);
    issue.upvotes = (issue.upvotes || 0) + 1;
    
    // Notify reporter if someone else upvotes
    if (userId !== issue.reportedBy) {
      const upvoter = await getUserById(userId);
      await addNotification(issue.reportedBy, {
        type: 'upvote', issueId, message: `${upvoter?.name || 'A user'} vouched for your report: "${issue.title}"`
      });
    }
  } else {
    issue.upvotedBy.splice(index, 1);
    issue.upvotes = Math.max(0, (issue.upvotes || 0) - 1);
  }
  return await updateIssue(issueId, issue);
}

// Users
export async function getUsers() {
  return await fetchDb('users');
}

export async function getUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}

export async function updateUser(id, updates) {
  return await putDb('users', id, updates);
}

// Applications
export async function getApplications() {
  return await fetchDb('applications');
}

export async function addApplication(application) {
  return await postDb('applications', application);
}

export async function updateApplication(id, updates) {
  return await putDb('applications', id, updates);
}

// Notifications
export async function getNotifications(userId) {
  const user = await getUserById(userId);
  return user?.notifications || [];
}

export async function addNotification(userId, notification) {
  const user = await getUserById(userId);
  if (!user) return;
  if (!user.notifications) user.notifications = [];
  user.notifications.unshift({
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
    read: false
  });
  await updateUser(userId, { notifications: user.notifications });
}

export async function broadcastNotification(notification) {
  const users = await getUsers();
  await Promise.all(users.map(u => addNotification(u.id, notification)));
}

export async function markNotificationsRead(userId) {
  const user = await getUserById(userId);
  if (!user) return;
  if (!user.notifications) return;
  const notifications = user.notifications.map(n => ({ ...n, read: true }));
  await updateUser(userId, { notifications });
}

// Feedbacks
export async function getFeedbacks() {
  const feedbacks = await fetchDb('feedbacks');
  return feedbacks || [];
}

export async function addFeedback(feedbackData) {
  const id = `fb-${Date.now()}`;
  return await postDb('feedbacks', {
    ...feedbackData,
    id,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
}

export async function updateFeedback(id, updates) {
  return await putDb('feedbacks', id, updates);
}

// Authentication Logic (Client-Side Cookies/Storage for Current User ID)
export function getSession() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ns_current_user');
}

export async function getCurrentUser() {
  const id = getSession();
  if (!id) return null;
  return await getUserById(id);
}

export function setCurrentUser(id) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ns_current_user', id);
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ns_current_user');
}

// Quests
export async function getQuests() {
  const quests = await fetchDb('quests');
  if (!quests || quests.length === 0) return seedData.quests;
  return quests;
}

export async function updateQuest(id, updates) {
  return await putDb('quests', id, updates);
}

// Achievements
export async function getAchievements() {
  const achievements = await fetchDb('achievements');
  if (!achievements || achievements.length === 0) return seedData.achievements;
  return achievements;
}

export async function unlockAchievement(achievementId) {
  const achievements = await getAchievements();
  const idx = achievements.findIndex(a => a.id === achievementId);
  if (idx !== -1 && !achievements[idx].unlocked) {
    await putDb('achievements', achievementId, {
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
  }
}

// Vitals History
export async function getVitalsHistory() {
  const history = await fetchDb('vitalsHistory');
  // API returns an array, but we need the object mapping
  // Let's assume fetchDb 'vitalsHistory' returns an array of 1 item with the mapping
  if (Array.isArray(history) && history.length > 0) return history[0];
  return history || {};
}

export async function updateNeighborhoodVitals(neighborhood, isResolved = false) {
  const vh = await getVitalsHistory();
  if (!vh || !vh[neighborhood]) return;
  
  const hoodHistory = vh[neighborhood];
  const current = hoodHistory[hoodHistory.length - 1];
  
  // Calculate new vital scores
  const bump = isResolved ? 2 : -1;
  const next = {
    date: new Date().toISOString().split('T')[0],
    infrastructure: Math.min(100, Math.max(0, current.infrastructure + bump)),
    safety: Math.min(100, Math.max(0, current.safety + bump)),
    cleanliness: Math.min(100, Math.max(0, current.cleanliness + bump)),
    responseSpeed: Math.min(100, Math.max(0, current.responseSpeed + (isResolved ? 3 : 0)))
  };
  
  hoodHistory.push(next);
  if (hoodHistory.length > 7) hoodHistory.shift(); // Keep last 7 days
  
  vh[neighborhood] = hoodHistory;
  
  // Save back. ID is 'main' typically.
  await putDb('vitalsHistory', 'main', vh);
}

// Engine Processors
export async function processUserAction(userId, actionType, category = null, extraData = {}) {
  const user = await getUserById(userId);
  if (!user) return;

  const xpReward = reputationEngine.getXPForAction(actionType) || 0;
  const spReward = reputationEngine.getPointsForAction(actionType) || 0;
  
  let updates = {
    xp: (user.xp || 0) + xpReward,
    shieldPoints: (user.shieldPoints || 0) + spReward,
  };
  
  if (actionType === 'report_issue') {
    updates.issuesReported = (user.issuesReported || 0) + 1;
    updates.currentStreak = (user.currentStreak || 0) + 1;
  }
  if (actionType === 'validate_issue') updates.issuesValidated = (user.issuesValidated || 0) + 1;
  
  // Check leveling
  const levelInfo = reputationEngine.getLevelInfo(updates.xp);
  if (levelInfo.level > (user.level || 1)) {
    updates.level = levelInfo.level;
    updates.title = levelInfo.title;
    await addNotification(userId, { type: 'levelup', message: `Level Up! You are now a Level ${updates.level} ${updates.title}!` });
  }

  // Process Quests
  const allQuests = await getQuests();
  const userQuests = user.activeQuests || allQuests.map(q => ({...q, progress: 0}));
  let updatedQuests = [];
  
  let qType = actionType;
  if (actionType === 'report_issue') qType = 'report';
  if (actionType === 'validate_issue') qType = 'validate';

  for (let q of userQuests) {
    if (q.completed) {
      updatedQuests.push(q);
      continue;
    }
    
    const nextQ = questEngine.checkQuestProgress(q, user, { type: qType, category, ...extraData });
    if (nextQ.completed && !q.completed) {
      updates.xp += nextQ.xpReward;
      updates.shieldPoints += nextQ.pointsReward;
      await addNotification(userId, { type: 'quest', message: `Quest Completed: ${nextQ.title}! Earned +${nextQ.xpReward} XP` });
    }
    updatedQuests.push(nextQ);
  }
  
  updates.activeQuests = updatedQuests;

  if (xpReward > 0 || spReward > 0) {
    await addNotification(userId, { type: 'reward', message: `Earned +${xpReward} XP and +${spReward} SP for your action!` });
  }

  await updateUser(userId, updates);
}

// Initialization
export function isInitialized() {
  if (typeof window === 'undefined') return true;
  if (!localStorage.getItem('ns_reseeded_v2')) {
    localStorage.setItem('ns_reseeded_v2', 'true');
    return false;
  }
  return true;
}

export async function initializeWithSeedData(seedData) {
  if (isInitialized()) return false;
  
  // Seed the backend DB via POST
  await postDb('issues', seedData.issues);
  await postDb('users', seedData.users);
  await postDb('quests', seedData.quests);
  await postDb('achievements', seedData.achievements);
  await postDb('vitalsHistory', seedData.vitalsHistory);
  
  setCurrentUser(seedData.currentUserId);
  localStorage.setItem('ns_initialized', 'true');
  return true;
}

export default {
  getIssues, getIssueById, addIssue, updateIssue, deleteIssue: () => {}, updateIssueStatus, addValidation,
  addComment, toggleUpvote,
  getUsers, getUserById, updateUser, getCurrentUser, setCurrentUser, logoutUser,
  getNotifications, addNotification, markNotificationsRead,
  getQuests, updateQuest, getAchievements, unlockAchievement,
  getVitalsHistory, updateNeighborhoodVitals, processUserAction, isInitialized, initializeWithSeedData,
  getApplications, addApplication, updateApplication
};
