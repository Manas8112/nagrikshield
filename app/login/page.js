'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../lib/authProvider';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Invalid credentials or user does not exist.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 400, margin: '80px auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="title-lg mb-1">Welcome Back</h1>
          <p className="text-muted" style={{ fontSize: 14 }}>Log in to continue protecting your community.</p>
        </div>

        <div style={{ background: 'var(--surface-hover)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 24, border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Judges / Evaluation</div>
          <div style={{ fontSize: 14 }}>
            Admin Email: <strong>admin@nagrik.in</strong><br />
            Password: <strong>admin123</strong>
          </div>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(246, 70, 93, 0.1)', border: '1px solid var(--trading-down)', color: 'var(--trading-down)', padding: 12, borderRadius: 'var(--radius-md)', fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>
            Log In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--muted)' }}>
          Don't have an account? <Link href="/register" className="text-primary">Register here</Link>
        </div>
      </div>
    </div>
  );
}
