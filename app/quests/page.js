'use client';

import { useEffect, useState } from 'react';
import { getQuests } from '../lib/storage';
import { getQuestProgressPercent, getQuestStatusLabel } from '../lib/questEngine';
import { useAuth } from '../lib/authProvider';
import { Sword, Shield, Moon, Zap, Users, Trash2, Search, Flame, Target, Trophy } from 'lucide-react';

const IconMap = {
  Sword, Shield, Moon, Zap, Users, Trash2, Search, Flame, Target, Trophy
};

export default function QuestsPage() {
  const { user } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const baseQuests = await getQuests();
      let finalQuests = (baseQuests || []).map(bq => {
        const userQ = (user && user.activeQuests) ? user.activeQuests.find(uq => uq.id === bq.id) : null;
        return userQ ? userQ : { ...bq, progress: 0 };
      });
      setQuests(finalQuests);
      setLoaded(true);
    }
    load();
  }, [user]);

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading quests...</div>;

  const activeQuests = quests.filter(q => q.active && !q.completed);
  const completedQuests = quests.filter(q => q.completed);

  return (
    <>
      <div style={{ padding: '40px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 40 }}>
        <h1 className="display-sm mb-2" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Trophy size={40} className="text-primary" /> Command <span className="text-primary">Quests</span>
        </h1>
        <p className="text-muted">Complete missions to earn XP, Shield Points, and unique titles</p>
      </div>

      <div className="grid-2">
        {/* Active Quests */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 className="title-md">Active Quests</h2>
            <span className="badge badge-info">{activeQuests.length} Available</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeQuests.map(quest => {
              const progress = getQuestProgressPercent(quest);
              const status = getQuestStatusLabel(quest);
              const IconComp = IconMap[quest.icon] || Target;
              
              return (
                <div key={quest.id} className="card animate-fade-in">
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flexShrink: 0, width: 60, height: 60, background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={28} className="text-primary" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <h3 className="title-sm">{quest.title}</h3>
                        <span className={`badge badge-${status.color === 'var(--accent-orange)' ? 'warning' : 'info'}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 12 }}>
                        {quest.description}
                      </p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span className="badge badge-info">+{quest.xpReward} XP</span>
                        <span className="badge badge-success">+{quest.pointsReward} SP</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                        <span>Progress</span>
                        <span>{quest.progress} / {quest.target}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {activeQuests.length === 0 && (
              <div className="card text-center text-muted">
                <Shield size={48} className="text-muted" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div>No active quests right now. Check back later!</div>
              </div>
            )}
          </div>
        </div>

        {/* Completed Quests */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 className="title-md">Completed</h2>
            <span className="badge badge-success">{completedQuests.length} Done</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {completedQuests.map(quest => {
              const IconComp = IconMap[quest.icon] || Target;
              return (
                <div key={quest.id} className="card animate-fade-in" style={{ opacity: 0.8, borderColor: 'var(--status-success)' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ flexShrink: 0 }}><IconComp size={32} className="text-muted" /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="title-sm">{quest.title}</h3>
                        <span className="badge badge-success">Completed</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>{quest.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {completedQuests.length === 0 && (
              <div className="card text-center text-muted">
                <Target size={48} className="text-muted" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div>You haven't completed any quests yet. Start your journey!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
