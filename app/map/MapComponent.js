'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { CATEGORIES } from '../lib/seedData';
import { AlertTriangle, Droplets, Trash2, Lightbulb, Hammer, AlertCircle, MapPin, Check, Dna } from 'lucide-react';

const IconMap = {
  AlertTriangle, Droplets, Trash2, Lightbulb, Hammer, AlertCircle
};

const SEVERITY_COLORS = {
  critical: '#E11D48', // var(--status-critical)
  high: '#D97706',    // var(--status-warning)
  medium: '#0D9488',  // var(--primary)
  low: '#059669',     // var(--status-success)
};

function getSevLevel(severity) {
  if (severity >= 8.5) return 'critical';
  if (severity >= 7) return 'high';
  if (severity >= 5) return 'medium';
  return 'low';
}

export default function MapComponent({ issues, initialCenter, initialZoom }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: '100%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading map...</div>;

  const center = initialCenter || [12.9352, 77.6245]; // Koramangala default
  const zoomLevel = initialZoom || 13;

  return (
    <MapContainer
      center={center}
      zoom={zoomLevel}
      style={{ height: '100%', width: '100%', background: '#f8fafc' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {issues.map(issue => {
        const sevLevel = getSevLevel(issue.severity);
        const color = SEVERITY_COLORS[sevLevel];
        const cat = CATEGORIES[issue.category.toUpperCase()] || CATEGORIES.OTHER;
        const CatIcon = IconMap[cat.icon] || AlertCircle;
        
        return (
          <CircleMarker
            key={issue.id}
            center={[issue.lat, issue.lng]}
            radius={issue.severity >= 8 ? 12 : issue.severity >= 6 ? 9 : 7}
            fillColor={color}
            color={color}
            weight={2}
            opacity={0.9}
            fillOpacity={0.6}
          >
            <Popup>
              <div style={{ minWidth: 200, fontFamily: 'Inter, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-main)' }}>
                  <CatIcon size={20} color={color} />
                  <strong style={{ fontSize: '0.875rem' }}>{issue.title}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> {issue.landmark}
                </div>
                <div style={{ fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                  <span style={{ color, fontWeight: 700 }}>Severity: {issue.severity.toFixed(1)}</span>
                  {' • '}
                  <span>Status: {issue.status.replace('_', ' ')}</span>
                </div>
                <div style={{ fontSize: '0.8rem', marginBottom: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} className="text-success" /> {issue.validators?.length || 0}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Dna size={12} /> {issue.dna}</span>
                </div>
                <Link href={`/issue/${issue.id}`} style={{ fontSize: '0.8rem', color: 'white', background: 'var(--primary)', padding: '6px 12px', borderRadius: 4, textDecoration: 'none', display: 'inline-block' }}>
                  View Details
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
