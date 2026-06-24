'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getIssues, getUsers } from './lib/storage';
import { useAuth } from './lib/authProvider';
import { getSeverityLevel, getDynamicSeverity } from './lib/resolutionKB';
import { Target, Map, Activity, CheckCircle, Users, Shield, User, Award, ArrowRight } from 'lucide-react';
import OnboardingTutorial from './components/OnboardingTutorial';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ issues: 0, resolved: 0, validators: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    async function load() {
      const issues = await getIssues();
      const users = await getUsers();
      setStats({
        issues: issues.length,
        resolved: issues.filter(i => i.status === 'resolved').length,
        validators: users.length,
      });
      const STATUS_ORDER = { 'reported': 1, 'validated': 2, 'in_progress': 3, 'resolved': 4 };
      
      const filteredIssues = issues.filter(i => 
        i.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const sortedIssues = [...filteredIssues].sort((a, b) => {
        if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
          return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setRecentIssues(searchQuery ? sortedIssues : sortedIssues.slice(0, 5));
    }
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  return (
    <>
      {/* Hero Band */}
      <div style={{ textAlign: 'center', padding: '60px 20px', borderBottom: '1px solid var(--border-light)', marginBottom: 40, background: 'linear-gradient(to bottom, #FFFFFF, var(--bg-main))' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ background: 'var(--surface-hover)', padding: '12px 24px', borderRadius: '99px', border: '1px solid var(--border-light)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} className="text-primary" />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Live City Pulse Monitoring</span>
          </div>
        </div>
        <h1 className="display-lg" style={{ marginBottom: 20 }}>
          CIVICTECH <span className="text-primary">COMMAND</span>
        </h1>
        <p className="title-md" style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 32px' }}>
          Report, validate, and track hyperlocal infrastructure issues with absolute transparency.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/report" className="btn btn-primary" style={{ height: 48, fontSize: 16, padding: '0 32px' }}>
            <Target size={20} />
            Report Issue
          </Link>
          <Link href="/map" className="btn btn-secondary" style={{ height: 48, fontSize: 16, padding: '0 32px' }}>
            <Map size={20} />
            View Map
          </Link>
        </div>
      </div>

      {/* Stats Band */}
      <div className="card-elevated" style={{ display: 'flex', justifyContent: 'space-around', margin: '-80px auto 60px', maxWidth: 800, padding: 32 }}>
        <div className="text-center">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Activity size={24} className="text-muted" /></div>
          <div className="number-display">{stats.issues}</div>
          <div className="text-muted" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Reports</div>
        </div>
        <div className="text-center" style={{ borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)', padding: '0 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><CheckCircle size={24} className="text-success" color="var(--status-success)" /></div>
          <div className="number-display">{stats.resolved}</div>
          <div className="text-muted" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Resolved</div>
        </div>
        <div className="text-center">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Users size={24} className="text-primary" /></div>
          <div className="number-display">{stats.validators}</div>
          <div className="text-muted" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Guardians</div>
        </div>
      </div>

      <OnboardingTutorial user={user} />

      <div className="grid-2" style={{ marginBottom: 60 }}>
        {/* Recent Issues Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <h2 className="title-md">Live Command Feed</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
              <input 
                type="text" 
                className="input" 
                placeholder="Search issues by name..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ maxWidth: 300, width: '100%' }}
              />
              <Link href="/map" className="btn btn-ghost" style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Location</th>
                <th>Severity</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.map(issue => {
                const dynSeverity = getDynamicSeverity(issue);
                const sev = getSeverityLevel(dynSeverity);
                return (
                  <tr key={issue.id}>
                    <td>
                      <Link href={`/issue/${issue.id}`} style={{ display: 'block' }}>
                        <div style={{ fontWeight: 600 }}>{issue.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{issue.category.toLowerCase().replace('_', ' ')}</div>
                      </Link>
                    </td>
                    <td style={{ fontSize: 14 }}>{issue.landmark}</td>
                    <td>
                      <span className={`badge badge-${sev.level}`}>
                        {dynSeverity.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge badge-muted">
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* User Card */}
        <div className="card" style={{ background: 'var(--bg-main)' }}>
          {user ? (
            <div className="text-center">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: 16, borderRadius: '50%' }}>
                  <User size={40} />
                </div>
              </div>
              <h3 className="title-md mb-1">{user.name}</h3>
              <p className="text-muted mb-4">{user.email}</p>
              
              <div className="grid-2" style={{ gap: 16, marginBottom: 24 }}>
                <div className="card text-center" style={{ padding: 16 }}>
                  <Award size={20} className="text-muted" style={{ margin: '0 auto 8px' }} />
                  <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>Level</div>
                  <div className="number-md text-primary">{user.level}</div>
                </div>
                <div className="card text-center" style={{ padding: 16 }}>
                  <Shield size={20} className="text-muted" style={{ margin: '0 auto 8px' }} />
                  <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>Shield Pts</div>
                  <div className="number-md" style={{ color: 'var(--status-success)' }}>{user.shieldPoints}</div>
                </div>
              </div>
              
              <Link href="/quests" className="btn btn-primary" style={{ width: '100%' }}>
                View Command Quests
              </Link>
            </div>
          ) : (
            <div className="text-center" style={{ padding: '40px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <Shield size={64} className="text-primary" opacity={0.2} />
              </div>
              <h3 className="title-lg mb-2">Join the Vanguard</h3>
              <p className="text-muted mb-6">
                Create an account to start earning XP, climbing the leaderboard, and unlocking unique titles.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/register" className="btn btn-primary" style={{ width: '100%', height: 44 }}>Register Account</Link>
                <Link href="/login" className="btn btn-secondary" style={{ width: '100%', height: 44 }}>Log In</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
