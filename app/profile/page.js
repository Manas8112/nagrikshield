'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../lib/authProvider';
import { getIssues, getAchievements, getUsers, updateUser, getApplications, addApplication, getQuests } from '../lib/storage';
import { getSeverityLevel, getDynamicSeverity } from '../lib/resolutionKB';
import { getLevelInfo } from '../lib/reputationEngine';
import { getQuestProgressPercent, getQuestStatusLabel } from '../lib/questEngine';
import { Shield, Award, CheckCircle, Target, Activity, LogOut, FileText, Edit2, Briefcase, Users, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import XboxAvatar from '../components/XboxAvatar';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [myIssues, setMyIssues] = useState([]);
  const [allies, setAllies] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [activeQuests, setActiveQuests] = useState([]);
  const [liveProfile, setLiveProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyDept, setApplyDept] = useState('Water');
  const [hasApplied, setHasApplied] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(0);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEditBio(user.bio || '');
    setAvatarSeed(user.avatarSeed ?? 0);

    async function load() {
      const [allIssues, allUsers, allAchievements, apps, allQuests] = await Promise.all([
        getIssues(),
        getUsers(),
        getAchievements(),
        getApplications(),
        getQuests(),
      ]);

      setMyIssues(allIssues.filter(i => i.reportedBy === user.id));

      // Load ally user objects from friends list
      const friendIds = user.friends || [];
      const friendUsers = allUsers.filter(u => friendIds.includes(u.id));
      setAllies(friendUsers);

      setUnlockedAchievements(allAchievements.filter(a => a.unlocked));
      
      const currentUserData = allUsers.find(u => u.id === user.id);
      if (currentUserData) {
        setLiveProfile(currentUserData);
      }

      // Merge base global quests with user's specific progress
      let finalQuests = (allQuests || []).map(bq => {
        const userQ = (currentUserData && currentUserData.activeQuests) ? currentUserData.activeQuests.find(uq => uq.id === bq.id) : null;
        return userQ ? userQ : { ...bq, progress: 0 };
      });
      setActiveQuests(finalQuests.filter(q => q.active && !q.completed));

      if (apps.find(a => a.userId === user.id && a.status === 'pending')) {
        setHasApplied(true);
      }
    }
    load();
  }, [user]);

  const handleSaveProfile = async () => {
    await fetch(`/api/database?model=users&id=${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: editBio })
    });
    window.location.reload();
  };

  const handleRandomizeAvatar = async () => {
    setSavingAvatar(true);
    const newSeed = Math.floor(Math.random() * 10000);
    setAvatarSeed(newSeed);
    await fetch(`/api/database?model=users&id=${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarSeed: newSeed })
    });
    setSavingAvatar(false);
  };

  const handleRemoveAlly = async (friendId) => {
    const updatedFriends = (user.friends || []).filter(id => id !== friendId);
    await fetch(`/api/database?model=users&id=${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friends: updatedFriends })
    });
    setAllies(prev => prev.filter(a => a.id !== friendId));
  };

  const handleApply = async () => {
    if (!applyDept) return;
    await addApplication({
      userId: user.id,
      userName: user.name,
      department: applyDept,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    
    // Notify Admin
    const allUsers = await getUsers();
    const admin = allUsers.find(u => u.role === 'admin');
    if (admin) {
      await addNotification(admin.id, {
        type: 'application',
        message: `${user.name} has applied for Head of ${applyDept} Department.`
      });
    }

    setHasApplied(true);
    setShowApplyModal(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>;
  if (!user) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <Shield size={64} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
      <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>You need to be logged in to view your profile.</p>
      <Link href="/login" className="btn btn-primary">Log In</Link>
    </div>
  );

  // Build a live user object with the current avatarSeed for the avatar component
  const liveUser = { ...user, avatarSeed };
  const displayUser = liveProfile || user;
  const levelInfo = getLevelInfo(displayUser.xp || 0);

  return (
    <>
      <div style={{ padding: '40px 0 24px', borderBottom: '1px solid var(--border-light)', marginBottom: 40 }}>
        <h1 className="display-sm mb-2">
          Citizen <span className="text-primary">Profile</span>
        </h1>
        <p className="text-muted">Manage your identity, track your impact, and view your allies.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* ─── LEFT: Identity + Stats + Achievements ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Identity Card */}
          <div className="card text-center" style={{ position: 'relative', paddingTop: 48 }}>
            {/* Top-right logout */}
            <button className="btn btn-ghost" style={{ position: 'absolute', top: 12, right: 12, padding: 8 }} onClick={logout} title="Logout">
              <LogOut size={18} className="text-muted" />
            </button>
            {/* Top-left edit */}
            <button className="btn btn-ghost" style={{ position: 'absolute', top: 12, left: 12, padding: 8 }} onClick={() => setIsEditing(!isEditing)} title="Edit Bio">
              <Edit2 size={18} className="text-secondary" />
            </button>

            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, position: 'relative', width: 'fit-content', margin: '0 auto 16px' }}>
              <XboxAvatar user={liveUser} size={96} style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
            </div>

            {/* Randomize button */}
            <button
              className="btn btn-secondary"
              onClick={handleRandomizeAvatar}
              disabled={savingAvatar}
              style={{ margin: '0 auto 20px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 14px' }}
            >
              <RefreshCw size={14} style={{ animation: savingAvatar ? 'spin 0.8s linear infinite' : 'none' }} />
              {savingAvatar ? 'Saving...' : 'Randomize Avatar'}
            </button>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.875rem' }}>Bio</label>
                  <textarea className="input" value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} placeholder="Tell the city about yourself..." />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveProfile}>Save</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="title-md mb-1">{displayUser.name}</h2>
                <p className="text-muted mb-2" style={{ fontSize: 13 }}>{displayUser.email}</p>
                {displayUser.bio && <p className="text-secondary mb-4" style={{ fontStyle: 'italic', fontSize: 14 }}>"{displayUser.bio}"</p>}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <span className="badge badge-info" style={{ fontSize: 13, padding: '4px 14px' }}>
                    {displayUser.role === 'department_head' ? `Head of ${displayUser.department}` : (displayUser.title || 'Citizen')}
                  </span>
                </div>

                {displayUser.role !== 'admin' && displayUser.role !== 'department_head' && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
                    {hasApplied ? (
                      <div className="badge badge-muted" style={{ width: '100%', justifyContent: 'center', padding: '8px' }}>
                        Department Application Pending
                      </div>
                    ) : (
                      <button className="btn btn-ghost" onClick={() => setShowApplyModal(true)} style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                        <Briefcase size={16} /> Apply for Department Head
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="title-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} className="text-primary" /> Impact Statistics
            </h3>
            <div className="grid-2" style={{ gap: 12 }}>
              {[
                { label: 'Level', value: displayUser.level, color: 'var(--primary)' },
                { label: 'Shield Pts', value: `${displayUser.shieldPoints} SP`, color: 'var(--status-success)' },
                { label: 'Reported', value: myIssues.length },
                { label: 'Allies', value: allies.length },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--surface-hover)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                  <div className="number-md" style={{ color: color || 'var(--text-main)' }}>{value}</div>
                </div>
              ))}
            </div>
            
            <div className="grid-3" style={{ gap: 12, marginTop: 12 }}>
              <div className="card text-center" style={{ padding: 12 }}>
                <div className="text-muted mb-1" style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>Total XP</div>
                <div className="number-sm text-primary">{displayUser.xp || 0}</div>
              </div>
              <div className="card text-center" style={{ padding: 12 }}>
                <div className="text-muted mb-1" style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>Shield Pts</div>
                <div className="number-sm" style={{ color: 'var(--status-warning)' }}>{displayUser.shieldPoints || 0}</div>
              </div>
              <div className="card text-center" style={{ padding: 12 }}>
                <div className="text-muted mb-1" style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>Accuracy</div>
                <div className="number-sm text-success">{((displayUser.accuracy || 1) * 100).toFixed(0)}%</div>
              </div>
            </div>

            {/* Level Progression Bar */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Level Progression</span>
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {levelInfo.currentLevel.xp} / {levelInfo.nextLevelObj.xp} XP to {levelInfo.nextTitle}
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--surface-hover)', borderRadius: 4, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: levelInfo.progressPercent + '%', 
                    height: '100%', 
                    background: 'var(--primary)', 
                    transition: 'width 0.4s ease' 
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <h3 className="title-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} className="text-primary" /> Achievements
            </h3>
            {unlockedAchievements.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>No achievements yet. Start reporting issues to earn them!</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {unlockedAchievements.map(a => (
                  <div key={a.id} className="tooltip-container" style={{ position: 'relative' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-round)', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary)' }}>
                      <span style={{ fontSize: 20 }}>🏅</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Quests */}
          <div className="card">
            <h3 className="title-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} className="text-primary" /> Active Quests
            </h3>
            {activeQuests.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>No active quests. Check the Quests tab for new missions!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeQuests.map(quest => {
                  const progress = getQuestProgressPercent(quest);
                  return (
                    <div key={quest.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{quest.title}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{quest.progress} / {quest.target}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface-hover)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: progress + '%', height: '100%', background: 'var(--status-warning)', transition: 'width 0.3s' }} />
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{quest.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Allies + Recent Issues ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* My Allies */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="title-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} className="text-primary" /> My Allies
              </h3>
              <span className="badge badge-muted">{allies.length} total</span>
            </div>

            {allies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
                <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                <p style={{ fontSize: 14 }}>No allies yet. Visit citizen profiles on the leaderboard to add allies!</p>
                <Link href="/leaderboard" className="btn btn-secondary" style={{ marginTop: 12, display: 'inline-flex' }}>
                  Browse Vanguard
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {allies.map(ally => (
                  <div key={ally.id} style={{ position: 'relative', padding: 16, border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', textAlign: 'center', transition: 'box-shadow 0.2s' }}>
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveAlly(ally.id)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, transition: 'opacity 0.2s' }}
                      title="Remove Ally"
                      onMouseEnter={e => e.target.style.opacity = 1}
                      onMouseLeave={e => e.target.style.opacity = 0.4}
                    >
                      <X size={14} color="var(--text-main)" />
                    </button>

                    <Link href={`/profile/${ally.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                        <XboxAvatar user={ally} size={52} style={{ borderRadius: '8px' }} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-main)', marginBottom: 4 }}>{ally.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Lv.{ally.level} · {ally.title || 'Citizen'}</div>
                      <span className="badge badge-muted" style={{ fontSize: 11 }}>{ally.shieldPoints} SP</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Issues */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="title-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} className="text-primary" /> My Field Operations
              </h3>
              <span className="badge badge-muted">{myIssues.length} reports</span>
            </div>

            {myIssues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
                <Target size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                <p style={{ fontSize: 14 }}>You haven't reported any issues yet.</p>
                <Link href="/report" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-flex' }}>
                  Report an Issue
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myIssues.slice(0, 8).map(issue => {
                  const dynSeverity = getDynamicSeverity(issue);
                  const sev = getSeverityLevel(dynSeverity);
                  return (
                    <Link href={`/issue/${issue.id}`} key={issue.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ padding: '12px 16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-main)', marginBottom: 4 }}>{issue.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{issue.landmark} · {new Date(issue.reportedAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <span className={`badge badge-${sev.level}`}>{dynSeverity.toFixed(1)}</span>
                          <span className={`badge badge-${issue.status === 'resolved' ? 'success' : issue.status === 'in_progress' ? 'info' : 'warning'}`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 400, padding: 32 }}>
            <h2 className="title-md mb-2">Apply for Department Head</h2>
            <p className="text-muted mb-4">Request authorization from the Admin to lead a city department.</p>
            <label className="text-muted" style={{ fontSize: 13 }}>Select Department</label>
            <select className="input mb-4" value={applyDept} onChange={(e) => setApplyDept(e.target.value)}>
              <option value="Water">Water & Sanitation</option>
              <option value="Roads">Roads & Transport</option>
              <option value="Electricity">Electricity Board</option>
              <option value="Parks">Parks & Recreation</option>
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleApply}>Submit Application</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
