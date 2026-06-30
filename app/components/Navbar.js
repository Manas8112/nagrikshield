'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authProvider';
import { getNotifications, markNotificationsRead } from '../lib/storage';
import { Shield, Bell, LogOut } from 'lucide-react';
import XboxAvatar from './XboxAvatar';

export default function Navbar() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    async function load() {
      if (user) {
        const notifs = await getNotifications(user.id);
        setNotifications(notifs || []);
      }
    }
    load();
  }, [user, pathname]);

  const handleNotificationsClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && user) {
      await markNotificationsRead(user.id);
      const notifs = await getNotifications(user.id);
      setNotifications(notifs || []);
    }
  };

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/map', label: 'Live Map' },
    { href: '/vitals', label: 'Civic Vitals' },
    { href: '/cascade', label: 'Cascade ROI' },
    { href: '/leaderboard', label: 'Vanguard' },
    { href: '/guide', label: 'Game Guide' },
    { href: '/tech-stack', label: 'Tech Stack' },
  ];

  if (user?.role === 'admin') {
    links.push({ href: '/admin', label: 'Command Center' });
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <Shield size={24} className="text-primary" />
          NAGRIKSHIELD
        </Link>
        
        <div className="navbar-links open" style={{ display: 'flex' }}>
          {links.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {!loading && user ? (
            <>
              {user.role !== 'admin' && (
                <Link href="/report" className="btn btn-primary" style={{ '@media(minWidth: 768px)': { display: 'flex' } }}>
                  Report Issue
                </Link>
              )}

              <div style={{ position: 'relative' }}>
                <button className="btn btn-ghost" style={{ padding: '8px', position: 'relative' }} onClick={handleNotificationsClick}>
                  <Bell size={20} className="text-secondary" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: 'var(--status-critical)', borderRadius: '50%' }} />
                  )}
                </button>
                
                {showNotifications && (
                  <div className="card" style={{ position: 'absolute', top: '100%', right: 0, width: 320, zIndex: 100, padding: 0, marginTop: 8, boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', fontWeight: 600 }}>Notifications</div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: n.read ? 'transparent' : 'rgba(13, 148, 136, 0.05)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: 4 }}>{n.message}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 10px 4px 4px', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', border: '1px solid var(--border-light)', textDecoration: 'none', color: 'var(--text-main)' }}>
                <XboxAvatar user={user} size={28} style={{ borderRadius: '5px' }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
              </Link>
              
              <button className="btn btn-ghost" style={{ padding: 8, color: 'var(--status-critical)' }} onClick={logout} title="Quick Logout">
                <LogOut size={20} />
              </button>
            </>
          ) : !loading && (
            <>
              <Link href="/login" className="btn btn-ghost">Log In</Link>
              <Link href="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
