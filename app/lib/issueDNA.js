// NagrikShield - Issue DNA Fingerprint Generator
// Creates unique genetic signature for each issue

export function generateDNA(issue) {
  const geoHash = simpleGeoHash(issue.lat, issue.lng, 7);
  const catCode = getCategoryCode(issue.category);
  const sevBucket = getSeverityBucket(issue.severity);
  const timeBucket = getTimeBucket(issue.reportedAt);
  const colorSig = issue.imageColor || '#606060';
  
  const raw = `${geoHash}-${catCode}-${sevBucket}-${timeBucket}-${colorSig}`;
  const hash = simpleHash(raw);
  
  return `${catCode}-${geoHash.substring(0, 3).toUpperCase()}-H${Math.round(issue.severity * 10)}-${hash}`;
}

export function computeSimilarity(dna1, dna2) {
  if (!dna1 || !dna2) return 0;
  const parts1 = dna1.split('-');
  const parts2 = dna2.split('-');
  
  let score = 0;
  // Same category
  if (parts1[0] === parts2[0]) score += 0.3;
  // Same geo area
  if (parts1[1] === parts2[1]) score += 0.35;
  // Similar severity
  if (parts1.length > 2 && parts2.length > 2) {
    const s1 = parseInt(parts1[2].replace('H', ''));
    const s2 = parseInt(parts2[2].replace('H', ''));
    if (Math.abs(s1 - s2) < 15) score += 0.2;
  }
  // Time proximity
  if (parts1.length > 3 && parts2.length > 3 && parts1[3] === parts2[3]) score += 0.15;
  
  return Math.min(1, score);
}

export function isDuplicate(newDNA, existingDNAs) {
  for (const existing of existingDNAs) {
    if (computeSimilarity(newDNA, existing) > 0.8) return true;
  }
  return false;
}

export function getDNASegments(dna) {
  if (!dna) return [];
  const parts = dna.split('-');
  const colors = ['#00f0ff', '#ff8800', '#00ff88', '#ff3366', '#a855f7', '#ffaa00'];
  
  return parts.map((part, i) => ({
    value: part,
    color: colors[i % colors.length],
    label: ['Category', 'Location', 'Severity', 'Hash'][i] || 'Data',
  }));
}

// Simple geohash implementation
function simpleGeoHash(lat, lng, precision) {
  const chars = '0123456789bcdefghjkmnpqrstuvwxyz';
  let hash = '';
  let minLat = -90, maxLat = 90;
  let minLng = -180, maxLng = 180;
  let isEven = true;
  let bit = 0;
  let ch = 0;
  
  while (hash.length < precision) {
    if (isEven) {
      const mid = (minLng + maxLng) / 2;
      if (lng > mid) { ch |= (1 << (4 - bit)); minLng = mid; }
      else { maxLng = mid; }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat > mid) { ch |= (1 << (4 - bit)); minLat = mid; }
      else { maxLat = mid; }
    }
    isEven = !isEven;
    if (bit < 4) { bit++; }
    else { hash += chars[ch]; bit = 0; ch = 0; }
  }
  return hash;
}

function getCategoryCode(category) {
  const codes = {
    pothole: 'POT', water_leak: 'WLK', garbage: 'GRB',
    streetlight: 'STL', damage: 'DMG', other: 'OTH',
  };
  return codes[category] || 'OTH';
}

function getSeverityBucket(severity) {
  if (severity >= 8) return 'CRT';
  if (severity >= 6) return 'HGH';
  if (severity >= 4) return 'MED';
  return 'LOW';
}

function getTimeBucket(dateStr) {
  const d = new Date(dateStr);
  const hour = d.getHours();
  if (hour < 6) return 'N';  // Night
  if (hour < 12) return 'M'; // Morning
  if (hour < 18) return 'A'; // Afternoon
  return 'E';                 // Evening
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).substring(0, 3).toUpperCase();
}

export default { generateDNA, computeSimilarity, isDuplicate, getDNASegments };
