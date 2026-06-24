'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '../lib/seedData';
import { getCascadeTree, flattenCascade, getTotalCascadeRisk, getPreventionSavings } from '../lib/cascadeEngine';
import { Zap, Clock, Coins, Lightbulb, Bot, AlertTriangle, Droplets, Trash2, Hammer, AlertCircle } from 'lucide-react';

const IconMap = {
  AlertTriangle, Droplets, Trash2, Lightbulb, Hammer, AlertCircle
};

export default function CascadePage() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.POTHOLE.id);

  const tree = getCascadeTree(selectedCategory);
  const flat = flattenCascade(tree);
  const risk = getTotalCascadeRisk(selectedCategory);
  const savings = getPreventionSavings(selectedCategory, 8); // Assuming high severity for demo

  return (
    <>
      <div style={{ padding: '40px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 40 }}>
        <h1 className="display-sm mb-2" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Zap size={40} className="text-primary" /> Cascade <span className="text-primary">Engine</span>
        </h1>
        <p className="text-muted">Predictive modeling of unaddressed community issues</p>
      </div>

      {/* Category Selector */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 24 }}>
        {Object.values(CATEGORIES).map(cat => {
          const IconComp = IconMap[cat.icon] || AlertTriangle;
          return (
            <button
              key={cat.id}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ whiteSpace: 'nowrap' }}
            >
              <IconComp size={16} /> {cat.label}
            </button>
          );
        })}
      </div>

      <div className="grid-2">
        {/* Cascade Visualizer */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
            <h3 className="title-md">Cause & Effect Chain</h3>
            <span className="badge badge-critical" style={{ fontSize: 13, padding: '6px 12px' }}>Risk Score: {risk}%</span>
          </div>

          <div style={{ padding: '10px 0' }}>
            {/* Root node */}
            <div className="card" style={{ borderColor: 'var(--primary)', background: 'rgba(13, 148, 136, 0.05)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={24} className="text-primary" />
                <span className="title-sm">{tree.name} (Unresolved)</span>
              </div>
            </div>

            {/* Flat nodes */}
            {flat.map((node, idx) => (
              <div key={idx} style={{ marginLeft: node.depth * 32, position: 'relative' }}>
                <div style={{ width: 2, height: 24, background: 'var(--border-medium)', marginLeft: 24 }} />
                <div className="card animate-fade-in" style={{ animationDelay: `${idx * 0.1}s`, padding: 16, borderLeft: '4px solid var(--status-warning)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={18} className="text-secondary" />
                      <span style={{ fontWeight: 600 }}>{node.name}</span>
                    </div>
                    <span className="badge badge-warning">{node.displayProbability}% Prob</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> <span style={{ color: 'var(--text-main)' }}>{node.timeframe}</span></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Coins size={14} /> <span style={{ color: 'var(--text-main)' }}>{node.cost}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info & Savings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* ROI Calculator */}
          <div className="card" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-medium)' }}>
            <h3 className="title-sm mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--status-warning)' }}>
              <Lightbulb size={20} /> Prevention ROI Analysis
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 24 }}>
              Fixing this issue early prevents cascading failures that exponentially increase costs and community impact.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600 }}>Cost to Fix Now</span>
                <span className="number-md" style={{ color: 'var(--status-success)' }}>{savings.fixNow}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600 }}>Cost if Cascades</span>
                <span className="number-md" style={{ color: 'var(--status-critical)' }}>{savings.ifCascades}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px', background: 'rgba(217, 119, 6, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--status-warning)', fontWeight: 700, textTransform: 'uppercase' }}>Savings Multiplier</span>
                <span className="number-display" style={{ color: 'var(--status-warning)', fontSize: '2rem' }}>{savings.savingsMultiplier}</span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="card">
            <h3 className="title-sm mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Bot size={18} className="text-primary" /> AI Insight</h3>
            <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
              The predictive cascade model uses historical civic data to calculate the probable chain reaction of unaddressed infrastructure issues. 
              <br/><br/>
              For <strong style={{ color: 'var(--text-main)' }}>{tree.name.toLowerCase()}</strong>, the most critical secondary effect is 
              <strong style={{ color: 'var(--primary)' }}> {flat[0]?.name}</strong> which has a {flat[0]?.displayProbability}% chance of occurring within {flat[0]?.timeframe}.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
