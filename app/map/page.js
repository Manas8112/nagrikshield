'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getIssues } from '../lib/storage';
import { CATEGORIES } from '../lib/seedData';
import { getSeverityLevel, getDynamicSeverity } from '../lib/resolutionKB';
import { Map as MapIcon, List, MapPin, AlertTriangle, Droplets, Trash2, Lightbulb, Hammer, AlertCircle } from 'lucide-react';

const IconMap = {
  AlertTriangle, Droplets, Trash2, Lightbulb, Hammer, AlertCircle
};

// Leaflet must be loaded client-side only
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

export default function MapPage() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mapParams, setMapParams] = useState(null);

  useEffect(() => {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const lat = params.get('lat');
    const lng = params.get('lng');
    const zoom = params.get('zoom');
    if (lat && lng) {
      setMapParams({ center: [parseFloat(lat), parseFloat(lng)], zoom: parseInt(zoom) || 15 });
    } else {
      setMapParams({ center: null, zoom: null });
    }

    async function load() {
      const allIssues = await getIssues();
      setIssues(allIssues || []);
    }
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredIssues = issues.filter(i => {
    if (filter !== 'all' && i.category !== filter) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <>
      <div style={{ padding: '40px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 40 }}>
        <h1 className="display-sm mb-2" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MapIcon size={40} className="text-primary" /> Live <span className="text-primary">Issue Map</span>
        </h1>
        <p className="text-muted">
          Explore {issues.length} community issues across Bengaluru
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 12 }}>
        <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All Categories</button>
        {Object.values(CATEGORIES).map(cat => {
          const IconComp = IconMap[cat.icon] || AlertCircle;
          return (
            <button
              key={cat.id}
              className={`btn ${filter === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(cat.id)}
              style={{ whiteSpace: 'nowrap' }}
            >
              <IconComp size={16} /> {cat.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 24 }}>
        {['all', 'reported', 'validated', 'in_progress', 'resolved'].map(s => (
          <button
            key={s}
            className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(s)}
            style={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}
          >
            {s === 'all' ? 'All Statuses' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card" style={{ height: 550, padding: 0, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        {mapParams && <MapComponent issues={filteredIssues} initialCenter={mapParams.center} initialZoom={mapParams.zoom} />}
      </div>

      {/* Issue list below map */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><List size={20} className="text-primary" /> {filteredIssues.length} Issues Shown</h2>
        </div>
        
        <div className="grid-2">
          {filteredIssues.slice(0, 10).map(issue => {
            const cat = CATEGORIES[issue.category.toUpperCase()] || CATEGORIES.OTHER;
            const dynSeverity = getDynamicSeverity(issue);
            const sev = getSeverityLevel(dynSeverity);
            const CatIcon = IconMap[cat.icon] || AlertCircle;
            
            return (
              <Link href={`/issue/${issue.id}`} key={issue.id} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 48, height: 48, background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CatIcon size={24} className="text-secondary" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="title-sm mb-2" style={{ color: 'var(--text-main)' }}>{issue.title}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <span className={`badge badge-${sev.level}`}>{dynSeverity.toFixed(1)}</span>
                        <span className={`badge badge-${issue.status === 'resolved' ? 'success' : issue.status === 'in_progress' ? 'info' : 'warning'}`}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> {issue.landmark}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
