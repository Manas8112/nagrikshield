'use client';

import { useEffect, useState } from 'react';
import { getVitalsHistory, getIssues } from '../lib/storage';
import { NEIGHBORHOODS } from '../lib/seedData';
import { generateHealthSummary } from '../lib/nlgEngine';
import { Activity, MapPin, Building2, Shield, Trash2, Zap, AlertTriangle, TrendingUp, Bot, Lightbulb } from 'lucide-react';

function VitalGauge({ value, label, color, icon: Icon, size = 140 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, marginBottom: 12 }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="var(--border-light)" strokeWidth="10" />
          <circle cx={size/2} cy={size/2} r={radius} fill="transparent"
            stroke={color} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} 
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={24} color={color} style={{ marginBottom: 4 }} />
          <span className="number-md" style={{ color: 'var(--text-main)', lineHeight: 1 }}>{value}</span>
        </div>
      </div>
      <span className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>{label}</span>
    </div>
  );
}

export default function VitalsPage() {
  const [history, setHistory] = useState(null);
  const [selectedHood, setSelectedHood] = useState('koramangala');
  const [loaded, setLoaded] = useState(false);

  const [liveVitals, setLiveVitals] = useState(null);

  useEffect(() => {
    async function load() {
      const [vh, issues] = await Promise.all([
        getVitalsHistory(),
        getIssues()
      ]);
      setHistory(vh || {});
      
      // Calculate dynamic health based on unresolved issues per neighborhood
      const activeIssues = (issues || []).filter(i => i.status !== 'resolved');
      const hoodIssues = activeIssues.filter(i => i.neighborhood === selectedHood);
      
      let baseHealth = { infrastructure: 100, safety: 100, cleanliness: 100, responseSpeed: 100 };
      
      for (const issue of hoodIssues) {
        if (issue.category === 'pothole' || issue.category === 'damage') {
          baseHealth.infrastructure -= issue.severity * 1.5;
          baseHealth.safety -= issue.severity * 0.5;
        } else if (issue.category === 'garbage' || issue.category === 'waste') {
          baseHealth.cleanliness -= issue.severity * 2.0;
        } else if (issue.category === 'water_leak') {
          baseHealth.infrastructure -= issue.severity;
          baseHealth.cleanliness -= issue.severity * 0.5;
        } else {
          baseHealth.safety -= issue.severity;
        }
      }
      
      // Normalize bounds
      for (const key in baseHealth) {
        baseHealth[key] = Math.max(0, Math.min(100, Math.round(baseHealth[key])));
      }
      
      setLiveVitals(baseHealth);
      setLoaded(true);
    }
    load();
  }, [selectedHood]);

  if (!loaded || !history) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading vitals...</div>;
  }

  const hoodData = history?.[selectedHood] || [];
  
  // Use live calculation instead of static fallback
  const latest = liveVitals || { infrastructure: 100, safety: 100, cleanliness: 100, responseSpeed: 100 };
  
  const hoodName = NEIGHBORHOODS.find(n => n.id === selectedHood)?.name || selectedHood;
  const healthSummary = generateHealthSummary(latest, hoodName);

  // Check for anomalies
  const anomalies = [];
  if (latest.infrastructure < 50) anomalies.push({ vital: 'Infrastructure', value: latest.infrastructure, icon: Building2 });
  if (latest.safety < 55) anomalies.push({ vital: 'Safety', value: latest.safety, icon: Shield });
  if (latest.cleanliness < 45) anomalies.push({ vital: 'Cleanliness', value: latest.cleanliness, icon: Trash2 });
  if (latest.responseSpeed < 40) anomalies.push({ vital: 'Response Speed', value: latest.responseSpeed, icon: Zap });

  return (
    <>
      <div style={{ padding: '40px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 40 }}>
        <h1 className="display-sm mb-2" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Activity size={40} className="text-primary" /> Neighborhood <span className="text-primary">Vital Signs</span>
        </h1>
        <p className="text-muted">Real-time health monitoring of your community infrastructure</p>
      </div>

      {/* Neighborhood Selector */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 24 }}>
        {NEIGHBORHOODS.map(n => (
          <button key={n.id} className={`btn ${selectedHood === n.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedHood(n.id)} style={{ whiteSpace: 'nowrap' }}>
            <MapPin size={16} /> {n.name}
          </button>
        ))}
      </div>

      {/* Overall Score */}
      <div className="card text-center animate-fade-in" style={{ marginBottom: 24, padding: '32px 24px' }}>
        <div className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>
          Overall Community Health Score
        </div>
        <div className="number-display" style={{
          fontSize: '4rem',
          color: healthSummary.overallScore >= 70 ? 'var(--status-success)' : healthSummary.overallScore >= 50 ? 'var(--status-warning)' : 'var(--status-critical)',
        }}>
          {healthSummary.overallScore}
        </div>
        <div className="text-secondary" style={{ fontSize: '0.95rem', maxWidth: 600, margin: '12px auto 0' }}>
          {healthSummary.status}
        </div>
      </div>

      {/* 4 Gauges */}
      <div className="card animate-fade-in" style={{ marginBottom: 24, padding: 32 }}>
        <div className="grid-4" style={{ justifyItems: 'center' }}>
          <VitalGauge value={latest.infrastructure} label="Infrastructure" color="var(--primary)" icon={Building2} />
          <VitalGauge value={latest.safety} label="Safety Index" color="var(--status-success)" icon={Shield} />
          <VitalGauge value={latest.cleanliness} label="Cleanliness" color="var(--status-warning)" icon={Trash2} />
          <VitalGauge value={latest.responseSpeed} label="Response Speed" color="var(--status-info)" icon={Zap} />
        </div>
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="animate-fade-in" style={{ marginBottom: 24 }}>
          <h3 className="title-md mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={20} className="text-primary" /> Anomaly Alerts</h3>
          <div className="grid-2">
            {anomalies.map((a, idx) => {
              const IconComp = a.icon;
              return (
                <div key={idx} className="card" style={{ borderColor: 'var(--status-critical)', background: 'rgba(225, 29, 72, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ color: 'var(--status-critical)' }}><IconComp size={32} /></div>
                    <div>
                      <div className="title-sm" style={{ color: 'var(--status-critical)', marginBottom: 4 }}>{a.vital} is LOW</div>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                        Current: <span style={{ fontWeight: 600 }}>{a.value}%</span> — Below safe threshold (50%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trend Chart (simplified) */}
      <div className="card animate-fade-in" style={{ marginBottom: 24 }}>
        <h3 className="title-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={20} className="text-primary" /> 30-Day Trend</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {['infrastructure', 'safety', 'cleanliness', 'responseSpeed'].map(vital => {
            const colors = { infrastructure: 'var(--primary)', safety: 'var(--status-success)', cleanliness: 'var(--status-warning)', responseSpeed: 'var(--status-info)' };
            const labels = { infrastructure: 'Infrastructure', safety: 'Safety', cleanliness: 'Cleanliness', responseSpeed: 'Response Speed' };
            const values = hoodData.map(d => d[vital]);
            const max = Math.max(...values, 1);
            const min = Math.min(...values);
            
            return (
              <div key={vital}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{labels[vital]}</span>
                  <span className="number-sm" style={{ color: colors[vital] }}>{latest[vital]}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
                  {values.map((v, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: `${((v - min + 5) / (max - min + 10)) * 100}%`,
                      background: colors[vital],
                      opacity: i === values.length - 1 ? 1 : 0.4,
                      borderRadius: '2px 2px 0 0',
                      minHeight: 4,
                      transition: 'height 0.5s ease',
                    }} title={`Day ${i + 1}: ${v}%`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Health Report */}
      <div className="card animate-fade-in" style={{ background: 'var(--bg-main)' }}>
        <h3 className="title-md mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Bot size={20} className="text-primary" /> AI Health Report</h3>
        <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 16 }}>
          {healthSummary.status}
        </p>
        <div style={{ padding: 16, background: 'rgba(13, 148, 136, 0.1)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Lightbulb size={20} className="text-primary" style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="text-primary" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            {healthSummary.recommendation}
          </p>
        </div>
      </div>
    </>
  );
}
