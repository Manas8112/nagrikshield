import { useState } from 'react';
import Link from 'next/link';
import { Target, CheckCircle, Shield, Camera, Award, ChevronRight, BookOpen, Star, AlertTriangle } from 'lucide-react';

export default function OnboardingTutorial({ user }) {
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.level >= 3 || dismissed) return null;

  const tasks = [
    {
      id: 'report',
      title: 'Report a Hazard',
      desc: 'Use the AI Vision tool to report your first community issue.',
      completed: (user.issuesReported || 0) > 0,
      link: '/report',
      icon: Camera,
      color: 'var(--primary)'
    },
    {
      id: 'validate',
      title: 'Validate the Swarm',
      desc: 'Check the map and validate an issue reported by another citizen.',
      completed: (user.issuesValidated || 0) > 0,
      link: '/map',
      icon: Shield,
      color: 'var(--status-success)'
    },
    {
      id: 'guide',
      title: 'Read the Field Guide',
      desc: 'Learn about Swarm DNA, Vitals, and the Reputation system.',
      completed: !!user.hasReadGuide,
      link: '/guide',
      icon: BookOpen,
      color: 'var(--status-warning)'
    },
    {
      id: 'level',
      title: 'Reach Level 2',
      desc: 'Earn enough XP through reporting and validating to level up.',
      completed: (user.level || 1) >= 2,
      link: '/profile',
      icon: Award,
      color: 'var(--status-info)'
    }
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="card animate-fade-in mb-6" style={{ background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.05) 0%, rgba(13, 148, 136, 0.15) 100%)', border: '1px solid var(--primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 className="title-md mb-1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star className="text-primary" size={20} /> Welcome to the Command Center, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-muted" style={{ fontSize: 14 }}>Complete your initiation checklist to master the CivicTech tools and level up.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => setDismissed(true)} style={{ color: 'var(--text-muted)' }}>Dismiss</button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
          <span>Initiation Progress</span>
          <span>{completedCount} / {tasks.length} Completed</span>
        </div>
        <div style={{ height: 6, background: 'var(--surface-hover)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--primary)', width: `${progress}%`, transition: 'width 0.5s ease-out' }} />
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        {tasks.map(task => {
          const Icon = task.icon;
          return (
            <Link key={task.id} href={task.link} style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ 
                background: 'var(--surface-card)', 
                border: `1px solid ${task.completed ? 'var(--status-success)' : 'var(--border-light)'}`, 
                borderRadius: 'var(--radius-md)', 
                padding: 16, 
                display: 'flex', 
                gap: 16, 
                alignItems: 'center',
                transition: 'all 0.2s',
                opacity: task.completed ? 0.7 : 1,
                cursor: 'pointer',
              }} className="hover-lift">
                <div style={{ background: task.completed ? 'var(--status-success)' : 'var(--surface-hover)', color: task.completed ? '#fff' : task.color, width: 40, height: 40, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {task.completed ? <CheckCircle size={20} /> : <Icon size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600, marginBottom: 4, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.4 }}>{task.desc}</p>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
