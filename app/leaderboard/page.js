'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '../lib/storage';
import { sortUsersByRank, getLevelInfo, getRankSuffix } from '../lib/reputationEngine';
import { Trophy, Medal, Award, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// Xbox style avatar generator
function getAvatarHue(id) {
  if (!id) return 0;
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const allUsers = await getUsers();
      setUsers(sortUsersByRank(allUsers));
      setLoaded(true);
    }
    load();
  }, []);

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading leaderboard...</div>;

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <>
      <div style={{ padding: '40px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 40, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Trophy size={48} className="text-primary" />
        </div>
        <h1 className="display-sm mb-2">Vanguard <span className="text-primary">Leaderboard</span></h1>
        <p className="text-muted">The top guardians protecting our community infrastructure</p>
      </div>

      {/* Podium for Top 3 */}
      {top3.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 48, marginTop: 32 }}>
          {/* 2nd Place */}
          <Link href={`/profile/${top3[1].id}`} className="card text-center hover-scale" style={{ width: 160, padding: 16, borderColor: 'var(--border-medium)', background: 'var(--surface-hover)', textDecoration: 'none', color: 'inherit' }}>
            <Medal size={24} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
            <div style={{ background: top3[1].photoUrl ? `url(${top3[1].photoUrl}) center/cover` : `hsl(${getAvatarHue(top3[1].id)}, 60%, 20%)`, border: `2px solid hsl(${getAvatarHue(top3[1].id)}, 80%, 40%)`, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              {!top3[1].photoUrl && <User size={24} className="text-white" />}
            </div>
            <div className="title-sm mb-1">{top3[1].name}</div>
            <div className="number-sm" style={{ color: 'var(--primary)' }}>{top3[1].shieldPoints} SP</div>
          </Link>

          {/* 1st Place */}
          <Link href={`/profile/${top3[0].id}`} className="card-elevated text-center hover-scale" style={{ width: 200, padding: 24, borderColor: 'var(--primary)', position: 'relative', zIndex: 10, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>RANK 1</div>
            <Trophy size={32} className="text-primary" style={{ margin: '0 auto 16px' }} />
            <div style={{ background: top3[0].photoUrl ? `url(${top3[0].photoUrl}) center/cover` : `hsl(${getAvatarHue(top3[0].id)}, 60%, 20%)`, border: `3px solid hsl(${getAvatarHue(top3[0].id)}, 80%, 40%)`, width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {!top3[0].photoUrl && <User size={32} className="text-white" />}
            </div>
            <div className="title-md mb-2">{top3[0].name}</div>
            <div className="number-md" style={{ color: 'var(--primary)' }}>{top3[0].shieldPoints} SP</div>
          </Link>

          {/* 3rd Place */}
          <Link href={`/profile/${top3[2].id}`} className="card text-center hover-scale" style={{ width: 160, padding: 16, borderColor: 'var(--border-medium)', background: 'var(--surface-hover)', textDecoration: 'none', color: 'inherit' }}>
            <Award size={24} style={{ color: '#b45309', margin: '0 auto 12px' }} />
            <div style={{ background: top3[2].photoUrl ? `url(${top3[2].photoUrl}) center/cover` : `hsl(${getAvatarHue(top3[2].id)}, 60%, 20%)`, border: `2px solid hsl(${getAvatarHue(top3[2].id)}, 80%, 40%)`, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              {!top3[2].photoUrl && <User size={24} className="text-white" />}
            </div>
            <div className="title-sm mb-1">{top3[2].name}</div>
            <div className="number-sm" style={{ color: 'var(--primary)' }}>{top3[2].shieldPoints} SP</div>
          </Link>
        </div>
      )}

      {/* Rankings Table */}
      <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead style={{ background: 'var(--surface-hover)' }}>
              <tr>
                <th style={{ paddingLeft: 24 }}>Rank</th>
                <th>Guardian</th>
                <th>Level</th>
                <th>Accuracy</th>
                <th>Reported</th>
                <th style={{ textAlign: 'right', paddingRight: 24 }}>Shield Points</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => {
                const rank = idx + 1;
                const lvl = getLevelInfo(user.xp);
                return (
                  <tr key={user.id}>
                    <td style={{ paddingLeft: 24 }}>
                      <span className="number-md text-muted" style={{ fontSize: 16 }}>
                        {rank}<span style={{ fontSize: 11, verticalAlign: 'top' }}>{rank > 3 ? getRankSuffix(rank) : ''}</span>
                      </span>
                    </td>
                    <td>
                      <Link href={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }} className="hover-text-primary">
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: user.photoUrl ? `url(${user.photoUrl}) center/cover` : `hsl(${getAvatarHue(user.id)}, 60%, 20%)`, border: `2px solid hsl(${getAvatarHue(user.id)}, 80%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {!user.photoUrl && <User size={16} className="text-white" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lvl.title}</div>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge-muted" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <ShieldCheck size={12} /> Lvl {lvl.level}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: user.accuracy >= 0.8 ? 'var(--status-success)' : 'var(--text-main)', fontWeight: 500 }}>
                        {Math.round(user.accuracy * 100)}%
                      </span>
                    </td>
                    <td className="number-sm">{user.issuesReported}</td>
                    <td style={{ textAlign: 'right', paddingRight: 24 }}>
                      <span className="number-md" style={{ color: rank <= 3 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                        {user.shieldPoints}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
