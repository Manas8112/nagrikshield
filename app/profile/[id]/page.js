'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/authProvider';
import { getUserById, getIssues, updateUser } from '../../lib/storage';
import { User as UserIcon, Shield, Award, Calendar, Activity, Check, Plus, Users } from 'lucide-react';
import XboxAvatar from '../../components/XboxAvatar';

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth(); // use verified session, not stale localStorage
  const [profileUser, setProfileUser] = useState(null);
  const [userIssues, setUserIssues] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await getUserById(id);
      if (!user) {
        router.push('/');
        return;
      }
      setProfileUser(user);
      
      const allIssues = await getIssues();
      const issues = allIssues.filter(i => i.reportedBy === user.id);
      setUserIssues(issues);
      setLoaded(true);
    }
    load();
  }, [id, router]);

  const [friendList, setFriendList] = useState(null); // local override for optimistic UI

  const handleAddFriend = async () => {
    // Auth guard — currentUser comes from verified session cookie via useAuth
    if (!currentUser) return router.push('/login');
    
    const currentFriends = friendList ?? currentUser.friends ?? [];
    const isFriend = currentFriends.includes(profileUser.id);
    const updatedFriends = isFriend
      ? currentFriends.filter(fId => fId !== profileUser.id)
      : [...currentFriends, profileUser.id];

    // Optimistic update
    setFriendList(updatedFriends);
    await updateUser(currentUser.id, { friends: updatedFriends });
  };

  if (!loaded || !profileUser) return <div style={{ padding: 40, textAlign: 'center' }}>Loading vanguard profile...</div>;

  const currentFriends = friendList ?? currentUser?.friends ?? [];
  const isFriend = currentFriends.includes(profileUser.id);
  const isSelf = currentUser?.id === profileUser.id;

  return (
    <>
      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={() => router.back()}>Back</button>
      </div>

      <div className="grid-2">
        {/* Left Column: Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card text-center" style={{ padding: '40px 20px', background: 'var(--surface-hover)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <XboxAvatar user={profileUser} size={110} style={{ borderRadius: '14px', boxShadow: '0 6px 24px rgba(0,0,0,0.18)' }} />
            </div>
            
            <h1 className="title-lg mb-1">{profileUser.name}</h1>
            <p className="text-secondary mb-4">{profileUser.role === 'admin' ? 'System Administrator' : 'Vanguard Citizen'}</p>
            
            {profileUser.bio && (
              <p className="text-main" style={{ fontStyle: 'italic', marginBottom: 24 }}>"{profileUser.bio}"</p>
            )}

            {!isSelf && (
              <button 
                onClick={handleAddFriend}
                className={`btn ${isFriend ? 'btn-secondary' : 'btn-primary'}`} 
                style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {isFriend ? <Check size={18} /> : <Plus size={18} />}
                {isFriend ? 'Vanguard Ally' : 'Add as Ally'}
              </button>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> Joined {new Date(parseInt(profileUser.id.split('-')[1]) || Date.now()).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {profileUser.friends?.length || 0} Allies</span>
            </div>
          </div>

          <div className="card">
            <h3 className="title-sm mb-4">Vanguard Statistics</h3>
            <div className="grid-2">
              <div style={{ padding: 16, background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Level</div>
                <div className="number-display text-primary">{profileUser.level || 1}</div>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Shield Points</div>
                <div className="number-display" style={{ color: 'var(--status-success)' }}>{profileUser.shieldPoints || 100}</div>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Accuracy</div>
                <div className="number-display text-main">{((profileUser.accuracy || 1) * 100).toFixed(0)}%</div>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Issues Reported</div>
                <div className="number-display text-main">{userIssues.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History & Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="card">
            <h3 className="title-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Award size={18} className="text-primary" /> Unlocked Badges</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {(!profileUser.achievements || profileUser.achievements.length === 0) ? (
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>No badges earned yet.</div>
              ) : (
                profileUser.achievements.map((badge, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', background: 'rgba(13, 148, 136, 0.1)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={14} /> {badge}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="title-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={18} className="text-primary" /> Field Operations</h3>
              <span className="badge badge-muted">{userIssues.length} total</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {userIssues.length === 0 ? (
                <div className="text-muted" style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.875rem' }}>No civic issues reported yet.</div>
              ) : (
                userIssues.map(issue => (
                  <Link href={`/issue/${issue.id}`} key={issue.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: 4 }}>{issue.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(issue.createdAt || Date.now()).toLocaleDateString()} • {issue.landmark}
                      </div>
                    </div>
                    <span className={`badge badge-${issue.status === 'resolved' ? 'success' : issue.status === 'in_progress' ? 'info' : 'warning'}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
