'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../lib/authProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Email already exists or server error.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 400, margin: '80px auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="title-lg mb-1">Create Account</h1>
          <p className="text-muted" style={{ fontSize: 14 }}>Join the NagrikShield vanguard.</p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(246, 70, 93, 0.1)', border: '1px solid var(--trading-down)', color: 'var(--trading-down)', padding: 12, borderRadius: 'var(--radius-md)', fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label className="label">Full Name</label>
            <input 
              type="text" 
              className="input" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            Register
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--muted)' }}>
          Already have an account? <Link href="/login" className="text-primary">Log in</Link>
        </div>
      </div>
    </div>
  );
}
