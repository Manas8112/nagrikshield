'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Maximize, Minimize, MapPin } from 'lucide-react';

// Fix Leaflet's default icon path issues in Next.js
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

function LocationMarker({ position, setPosition }) {
  const markerRef = useRef(null);
  
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition({ lat: pos.lat, lng: pos.lng });
        },
      }}
      ref={markerRef}
    />
  );
}

export default function LocationPicker({ location, setLocation, onGetLocation }) {
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: 300, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>Loading Map...</div>;

  const center = [location.lat, location.lng];
  const containerStyle = isFullscreen ? {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    background: 'var(--bg-main)'
  } : {
    height: 300, width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)', position: 'relative', zIndex: 0
  };

  return (
    <div style={containerStyle}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker position={location} setPosition={setLocation} />
        <MapUpdater position={location} />
      </MapContainer>
      
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: 8, flexDirection: 'column' }}>
        <button 
          onClick={(e) => { e.preventDefault(); setIsFullscreen(!isFullscreen); }}
          style={{ background: 'white', border: '2px solid rgba(0,0,0,0.2)', borderRadius: 4, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'black' }}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
        {onGetLocation && (
          <button 
            onClick={(e) => { e.preventDefault(); onGetLocation(); }}
            style={{ background: 'white', border: '2px solid rgba(0,0,0,0.2)', borderRadius: 4, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'black' }}
            title="Get Current Location"
          >
            <MapPin size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
