// NagrikShield - Rich Demo Seed Data
// 25+ issues, 15 users, quests, achievements, vitals history
// Focused on Bengaluru, India

const CATEGORIES = {
  POTHOLE: { id: 'pothole', label: 'Pothole / Road Damage', icon: 'AlertTriangle', code: 'POT', baseWeight: 7 },
  WATER_LEAK: { id: 'water_leak', label: 'Water Leak / Drainage', icon: 'Droplets', code: 'WLK', baseWeight: 8 },
  GARBAGE: { id: 'garbage', label: 'Garbage / Waste Dump', icon: 'Trash2', code: 'GRB', baseWeight: 6 },
  STREETLIGHT: { id: 'streetlight', label: 'Streetlight / Electrical', icon: 'Lightbulb', code: 'STL', baseWeight: 7 },
  DAMAGE: { id: 'damage', label: 'Infrastructure Damage', icon: 'Hammer', code: 'DMG', baseWeight: 8 },
  OTHER: { id: 'other', label: 'Other Issue', icon: 'AlertCircle', code: 'OTH', baseWeight: 5 },
};

const STATUS = {
  REPORTED: 'reported',
  VALIDATED: 'validated',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  DISPUTED: 'disputed',
};

const NEIGHBORHOODS = [
  { id: 'koramangala', name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { id: 'indiranagar', name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { id: 'jayanagar', name: 'Jayanagar', lat: 12.9308, lng: 77.5838 },
  { id: 'whitefield', name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
  { id: 'hsr_layout', name: 'HSR Layout', lat: 12.9116, lng: 77.6389 },
  { id: 'malleshwaram', name: 'Malleshwaram', lat: 12.9966, lng: 77.5713 },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

const users = [
  { id: 'u1',  name: 'Arjun Reddy',      email: 'arjun@nagrik.in',    password: 'arjun123',    avatarSeed: 0, friends: ['u2','u3','u8'],          level: 18, xp: 4500,  shieldPoints: 320, issuesReported: 45, issuesValidated: 120, accuracy: 0.94, neighborhood: 'koramangala', joinedAt: daysAgo(180), title: 'Champion' },
  { id: 'u2',  name: 'Priya Sharma',     email: 'priya@nagrik.in',    password: 'priya123',    avatarSeed: 1, friends: ['u1','u4','u8','u12'],     level: 22, xp: 6200,  shieldPoints: 580, issuesReported: 78, issuesValidated: 200, accuracy: 0.97, neighborhood: 'indiranagar', joinedAt: daysAgo(240), title: 'Legend' },
  { id: 'u3',  name: 'Karthik Nair',     email: 'karthik@nagrik.in',  password: 'karthik123',  avatarSeed: 2, friends: ['u1','u9','u15'],          level: 12, xp: 2100,  shieldPoints: 150, issuesReported: 22, issuesValidated: 55,  accuracy: 0.88, neighborhood: 'jayanagar',   joinedAt: daysAgo(90),  title: 'Guardian' },
  { id: 'u4',  name: 'Ananya Rao',       email: 'ananya@nagrik.in',   password: 'ananya123',   avatarSeed: 3, friends: ['u2','u10'],               level: 15, xp: 3300,  shieldPoints: 245, issuesReported: 38, issuesValidated: 90,  accuracy: 0.91, neighborhood: 'whitefield',  joinedAt: daysAgo(150), title: 'Guardian' },
  { id: 'u5',  name: 'Rahul Gowda',      email: 'rahul@nagrik.in',    password: 'rahul123',    avatarSeed: 4, friends: ['u6','u13'],               level: 8,  xp: 1200,  shieldPoints: 85,  issuesReported: 15, issuesValidated: 30,  accuracy: 0.85, neighborhood: 'hsr_layout',  joinedAt: daysAgo(60),  title: 'Ranger' },
  { id: 'u6',  name: 'Deepika Iyer',     email: 'deepika@nagrik.in',  password: 'deepika123',  avatarSeed: 5, friends: ['u5','u1','u13'],          level: 10, xp: 1800,  shieldPoints: 120, issuesReported: 20, issuesValidated: 48,  accuracy: 0.90, neighborhood: 'koramangala', joinedAt: daysAgo(120), title: 'Ranger' },
  { id: 'u7',  name: 'Suresh Kumar',     email: 'suresh@nagrik.in',   password: 'suresh123',   avatarSeed: 6, friends: ['u12','u15'],              level: 6,  xp: 800,   shieldPoints: 55,  issuesReported: 10, issuesValidated: 18,  accuracy: 0.82, neighborhood: 'malleshwaram',joinedAt: daysAgo(45),  title: 'Ranger' },
  { id: 'u8',  name: 'Meera Joshi',      email: 'meera@nagrik.in',    password: 'meera123',    avatarSeed: 7, friends: ['u1','u2','u10','u14'],    level: 20, xp: 5800,  shieldPoints: 490, issuesReported: 65, issuesValidated: 180, accuracy: 0.96, neighborhood: 'indiranagar', joinedAt: daysAgo(200), title: 'Champion' },
  { id: 'u9',  name: 'Vikram Singh',     email: 'vikram@nagrik.in',   password: 'vikram123',   avatarSeed: 8, friends: ['u3'],                    level: 4,  xp: 450,   shieldPoints: 30,  issuesReported: 6,  issuesValidated: 10,  accuracy: 0.78, neighborhood: 'jayanagar',   joinedAt: daysAgo(20),  title: 'Scout' },
  { id: 'u10', name: 'Lakshmi Menon',    email: 'lakshmi@nagrik.in',  password: 'lakshmi123',  avatarSeed: 9, friends: ['u4','u8'],               level: 14, xp: 2900,  shieldPoints: 210, issuesReported: 32, issuesValidated: 75,  accuracy: 0.92, neighborhood: 'whitefield',  joinedAt: daysAgo(130), title: 'Guardian' },
  { id: 'u11', name: 'Aditya Patel',     email: 'aditya@nagrik.in',   password: 'aditya123',   avatarSeed: 10,friends: [],                         level: 3,  xp: 280,   shieldPoints: 18,  issuesReported: 4,  issuesValidated: 5,   accuracy: 0.75, neighborhood: 'hsr_layout',  joinedAt: daysAgo(10),  title: 'Scout' },
  { id: 'u12', name: 'Kavitha Rangan',   email: 'kavitha@nagrik.in',  password: 'kavitha123',  avatarSeed: 11,friends: ['u2','u7'],                level: 16, xp: 3800,  shieldPoints: 290, issuesReported: 42, issuesValidated: 95,  accuracy: 0.93, neighborhood: 'malleshwaram',joinedAt: daysAgo(160), title: 'Champion' },
  { id: 'u13', name: 'Mohammed Farhan',  email: 'farhan@nagrik.in',   password: 'farhan123',   avatarSeed: 12,friends: ['u5','u6'],                level: 9,  xp: 1500,  shieldPoints: 100, issuesReported: 18, issuesValidated: 40,  accuracy: 0.87, neighborhood: 'koramangala', joinedAt: daysAgo(75),  title: 'Ranger' },
  { id: 'u14', name: 'Sneha Kulkarni',   email: 'sneha@nagrik.in',    password: 'sneha123',    avatarSeed: 13,friends: ['u8'],                    level: 7,  xp: 950,   shieldPoints: 65,  issuesReported: 12, issuesValidated: 22,  accuracy: 0.84, neighborhood: 'indiranagar', joinedAt: daysAgo(50),  title: 'Ranger' },
  { id: 'u15', name: 'Ravi Shankar',     email: 'ravi@nagrik.in',     password: 'ravi123',     avatarSeed: 14,friends: ['u3','u7'],               level: 11, xp: 1950,  shieldPoints: 140, issuesReported: 25, issuesValidated: 60,  accuracy: 0.89, neighborhood: 'jayanagar',   joinedAt: daysAgo(100), title: 'Guardian' },
];

const issues = [
  {
    id: 'iss-001', category: 'pothole', title: 'Deep pothole on 80 Feet Road',
    description: 'A dangerous pothole approximately 2 feet wide and 8 inches deep has formed on 80 Feet Road near the Koramangala water tank junction. Multiple vehicles have been damaged. The pothole fills with water during rain making it invisible to drivers.',
    severity: 8.5, status: STATUS.VALIDATED, reportedBy: 'u1',
    lat: 12.9352, lng: 77.6190, neighborhood: 'koramangala',
    landmark: 'Koramangala Water Tank Junction',
    reportedAt: daysAgo(3), updatedAt: hoursAgo(6),
    validators: ['u2', 'u3', 'u6', 'u8'], disputes: [],
    swarmConfidence: 0.92, stakeTotal: 45,
    timeline: [
      { action: 'reported', by: 'u1', at: daysAgo(3), note: 'Issue reported with photo evidence' },
      { action: 'validated', by: 'u2', at: daysAgo(3), note: 'Confirmed - drove past this today' },
      { action: 'validated', by: 'u3', at: daysAgo(2), note: 'Very dangerous, needs urgent fix' },
      { action: 'validated', by: 'u6', at: daysAgo(2), note: 'Saw a bike skid here yesterday' },
      { action: 'validated', by: 'u8', at: daysAgo(1), note: 'Still unfixed, getting worse' },
    ],
    image: '/seed/pothole.png',
    dna: 'POT-KRM-H85-3DA',
  },
  {
    id: 'iss-002', category: 'water_leak', title: 'Major water pipeline burst on 12th Main',
    description: 'A major water pipeline has burst near 12th Main Road, Indiranagar. Water is gushing out and flooding the road. The leak has been ongoing for 2 days with no response from BWSSB. Nearby houses are facing water shortage.',
    severity: 9.2, status: STATUS.IN_PROGRESS, reportedBy: 'u2',
    lat: 12.9784, lng: 77.6408, neighborhood: 'indiranagar',
    landmark: '12th Main Indiranagar',
    reportedAt: daysAgo(2), updatedAt: hoursAgo(3),
    validators: ['u1', 'u4', 'u8', 'u14', 'u3'], disputes: [],
    swarmConfidence: 0.96, stakeTotal: 78,
    timeline: [
      { action: 'reported', by: 'u2', at: daysAgo(2), note: 'Massive leak, road flooded' },
      { action: 'validated', by: 'u1', at: daysAgo(2), note: 'Confirmed, water wasting rapidly' },
      { action: 'validated', by: 'u4', at: daysAgo(1), note: 'Entire road is waterlogged' },
      { action: 'status_change', by: 'system', at: hoursAgo(8), note: 'BWSSB team dispatched' },
      { action: 'in_progress', by: 'system', at: hoursAgo(3), note: 'Repair work started' },
    ],
    image: '/seed/water.png',
    dna: 'WLK-IND-H92-2DB',
  },
  {
    id: 'iss-003', category: 'garbage', title: 'Garbage dumping near park entrance',
    description: 'Illegal garbage dumping has been happening near the entrance of Jayanagar 4th Block Park. Plastic waste, food scraps, and construction debris piled up. Strong foul smell. Stray dogs gathering in the area creating nuisance.',
    severity: 6.8, status: STATUS.VALIDATED, reportedBy: 'u3',
    lat: 12.9260, lng: 77.5820, neighborhood: 'jayanagar',
    landmark: 'Jayanagar 4th Block Park',
    reportedAt: daysAgo(5), updatedAt: daysAgo(1),
    validators: ['u9', 'u15'], disputes: [],
    swarmConfidence: 0.84, stakeTotal: 22,
    timeline: [
      { action: 'reported', by: 'u3', at: daysAgo(5), note: 'Garbage pile growing daily' },
      { action: 'validated', by: 'u9', at: daysAgo(4), note: 'Can confirm, very unhygienic' },
      { action: 'validated', by: 'u15', at: daysAgo(3), note: 'BBMP should act immediately' },
    ],
    image: '/seed/garbage.png',
    dna: 'GRB-JAY-H68-5DC',
  },
  {
    id: 'iss-004', category: 'streetlight', title: 'Entire street dark - 5 lights out',
    description: 'Five consecutive streetlights on ITPL Main Road near Whitefield are completely non-functional. The stretch is extremely dark and dangerous at night. There have been reports of chain snatching in this area.',
    severity: 8.0, status: STATUS.REPORTED, reportedBy: 'u4',
    lat: 12.9698, lng: 77.7500, neighborhood: 'whitefield',
    landmark: 'ITPL Main Road',
    reportedAt: daysAgo(1), updatedAt: daysAgo(1),
    validators: ['u10'], disputes: [],
    swarmConfidence: 0.65, stakeTotal: 15,
    timeline: [
      { action: 'reported', by: 'u4', at: daysAgo(1), note: 'Extremely dangerous at night' },
      { action: 'validated', by: 'u10', at: hoursAgo(18), note: 'Yes, very scary to walk here at night' },
    ],
    image: '/seed/light.png',
    dna: 'STL-WHT-H80-1DD',
  },
  {
    id: 'iss-005', category: 'pothole', title: 'Series of potholes on HSR 27th Main',
    description: 'Multiple potholes have formed on 27th Main Road, HSR Layout Sector 1. At least 4 large potholes within a 200m stretch. The road was recently dug up for cable laying and never properly restored.',
    severity: 7.2, status: STATUS.VALIDATED, reportedBy: 'u5',
    lat: 12.9116, lng: 77.6389, neighborhood: 'hsr_layout',
    landmark: 'HSR 27th Main Road',
    reportedAt: daysAgo(7), updatedAt: daysAgo(2),
    validators: ['u1', 'u11'], disputes: [],
    swarmConfidence: 0.81, stakeTotal: 18,
    timeline: [
      { action: 'reported', by: 'u5', at: daysAgo(7), note: 'Road is in terrible condition' },
      { action: 'validated', by: 'u1', at: daysAgo(5), note: 'Confirmed during morning jog' },
      { action: 'validated', by: 'u11', at: daysAgo(3), note: 'My car tire got damaged here' },
    ],
    image: '/seed/pothole.png',
    dna: 'POT-HSR-H72-7DE',
  },
  {
    id: 'iss-006', category: 'damage', title: 'Cracked footpath near bus stop',
    description: 'The footpath near Malleshwaram Circle bus stop has severely cracked and is partially caved in. Pedestrians especially elderly people are at risk. Steel rebar is exposed creating a tripping hazard.',
    severity: 7.8, status: STATUS.VALIDATED, reportedBy: 'u7',
    lat: 12.9966, lng: 77.5713, neighborhood: 'malleshwaram',
    landmark: 'Malleshwaram Circle Bus Stop',
    reportedAt: daysAgo(4), updatedAt: daysAgo(1),
    validators: ['u12', 'u15', 'u3'], disputes: [],
    swarmConfidence: 0.89, stakeTotal: 35,
    timeline: [
      { action: 'reported', by: 'u7', at: daysAgo(4), note: 'Footpath is caving in' },
      { action: 'validated', by: 'u12', at: daysAgo(3), note: 'Very dangerous for elderly' },
      { action: 'validated', by: 'u15', at: daysAgo(2), note: 'Exposed rebar is hazardous' },
      { action: 'validated', by: 'u3', at: daysAgo(1), note: 'Someone fell here yesterday' },
    ],
    imageColor: '#7D7368',
    dna: 'DMG-MAL-H78-4DF',
  },
  {
    id: 'iss-007', category: 'garbage', title: 'Construction debris blocking drain',
    description: 'Construction debris from a nearby building site has been dumped into the storm water drain on 5th Cross, Koramangala. The drain is completely blocked. With monsoon approaching this could cause severe flooding.',
    severity: 8.8, status: STATUS.VALIDATED, reportedBy: 'u6',
    lat: 12.9340, lng: 77.6200, neighborhood: 'koramangala',
    landmark: '5th Cross Koramangala',
    reportedAt: daysAgo(2), updatedAt: hoursAgo(12),
    validators: ['u1', 'u13', 'u2', 'u8'], disputes: [],
    swarmConfidence: 0.93, stakeTotal: 55,
    timeline: [
      { action: 'reported', by: 'u6', at: daysAgo(2), note: 'Drain completely blocked by debris' },
      { action: 'validated', by: 'u1', at: daysAgo(2), note: 'Flooding risk is real' },
      { action: 'validated', by: 'u13', at: daysAgo(1), note: 'Construction site nearby is responsible' },
      { action: 'validated', by: 'u2', at: daysAgo(1), note: 'This needs immediate BBMP action' },
      { action: 'validated', by: 'u8', at: hoursAgo(12), note: 'Water already stagnating' },
    ],
    imageColor: '#A09070',
    dna: 'GRB-KRM-H88-2DG',
  },
  {
    id: 'iss-008', category: 'water_leak', title: 'Sewage overflow on residential street',
    description: 'Sewage is overflowing from a manhole on 3rd Main Road, HSR Layout Sector 2. The entire street is flooded with sewage water. Residents are unable to step out of their homes. Severe health hazard.',
    severity: 9.5, status: STATUS.IN_PROGRESS, reportedBy: 'u5',
    lat: 12.9130, lng: 77.6350, neighborhood: 'hsr_layout',
    landmark: '3rd Main Road HSR Sector 2',
    reportedAt: daysAgo(1), updatedAt: hoursAgo(2),
    validators: ['u1', 'u2', 'u4', 'u6', 'u8', 'u11'], disputes: [],
    swarmConfidence: 0.98, stakeTotal: 95,
    timeline: [
      { action: 'reported', by: 'u5', at: daysAgo(1), note: 'Emergency - sewage flooding' },
      { action: 'validated', by: 'u11', at: daysAgo(1), note: 'Confirmed, cannot leave home' },
      { action: 'validated', by: 'u1', at: hoursAgo(20), note: 'Health emergency!' },
      { action: 'validated', by: 'u2', at: hoursAgo(18), note: 'BWSSB must respond NOW' },
      { action: 'status_change', by: 'system', at: hoursAgo(5), note: 'Emergency team dispatched' },
      { action: 'in_progress', by: 'system', at: hoursAgo(2), note: 'Cleanup underway' },
    ],
    imageColor: '#4A6B3D',
    dna: 'WLK-HSR-H95-1DH',
  },
  {
    id: 'iss-009', category: 'pothole', title: 'Crater-sized pothole on service road',
    description: 'A massive pothole has formed on the Outer Ring Road service road near Marathahalli. The pothole is over 3 feet wide and a foot deep. Already caused two accidents this week.',
    severity: 9.0, status: STATUS.REPORTED, reportedBy: 'u4',
    lat: 12.9568, lng: 77.7011, neighborhood: 'whitefield',
    landmark: 'ORR Service Road Marathahalli',
    reportedAt: hoursAgo(8), updatedAt: hoursAgo(8),
    validators: [], disputes: [],
    swarmConfidence: 0.0, stakeTotal: 10,
    timeline: [
      { action: 'reported', by: 'u4', at: hoursAgo(8), note: 'Extremely dangerous crater on road' },
    ],
    imageColor: '#4D4030',
    dna: 'POT-WHT-H90-0DI',
  },
  {
    id: 'iss-010', category: 'streetlight', title: 'Flickering streetlight creating hazard',
    description: 'A streetlight on Church Street, Indiranagar is rapidly flickering on and off causing disorientation to drivers. The strobe-like effect is dangerous for those with photosensitive conditions.',
    severity: 5.5, status: STATUS.REPORTED, reportedBy: 'u14',
    lat: 12.9790, lng: 77.6390, neighborhood: 'indiranagar',
    landmark: 'Church Street Indiranagar',
    reportedAt: daysAgo(1), updatedAt: daysAgo(1),
    validators: ['u2'], disputes: [],
    swarmConfidence: 0.58, stakeTotal: 8,
    timeline: [
      { action: 'reported', by: 'u14', at: daysAgo(1), note: 'Dangerous flickering light' },
      { action: 'validated', by: 'u2', at: hoursAgo(20), note: 'Can confirm, very distracting while driving' },
    ],
    imageColor: '#2C2C3E',
    dna: 'STL-IND-H55-1DJ',
  },
  {
    id: 'iss-011', category: 'garbage', title: 'Overflowing garbage bin at market',
    description: 'The community garbage bin outside KR Market junction has been overflowing for a week. Garbage is spread across the sidewalk. Food waste is attracting rats and stray animals.',
    severity: 6.2, status: STATUS.RESOLVED, reportedBy: 'u12',
    lat: 12.9980, lng: 77.5700, neighborhood: 'malleshwaram',
    landmark: 'KR Market Junction Malleshwaram',
    reportedAt: daysAgo(10), updatedAt: daysAgo(3),
    validators: ['u7', 'u15', 'u3'], disputes: [],
    swarmConfidence: 0.87, stakeTotal: 28,
    timeline: [
      { action: 'reported', by: 'u12', at: daysAgo(10), note: 'Bin overflowing for days' },
      { action: 'validated', by: 'u7', at: daysAgo(9), note: 'Horrible smell in the area' },
      { action: 'validated', by: 'u15', at: daysAgo(8), note: 'Rats everywhere at night' },
      { action: 'in_progress', by: 'system', at: daysAgo(5), note: 'BBMP pourakarmikas dispatched' },
      { action: 'resolved', by: 'system', at: daysAgo(3), note: 'Bin cleared and sanitized' },
    ],
    imageColor: '#8B7355',
    dna: 'GRB-MAL-H62-ADK',
  },
  {
    id: 'iss-012', category: 'damage', title: 'Broken boundary wall leaning on road',
    description: 'The boundary wall of an abandoned property on CMH Road is severely leaning towards the road. Large cracks visible. Could collapse any time especially during rain or wind.',
    severity: 8.3, status: STATUS.VALIDATED, reportedBy: 'u8',
    lat: 12.9750, lng: 77.6350, neighborhood: 'indiranagar',
    landmark: 'CMH Road Indiranagar',
    reportedAt: daysAgo(3), updatedAt: daysAgo(1),
    validators: ['u2', 'u14', 'u1'], disputes: [],
    swarmConfidence: 0.90, stakeTotal: 40,
    timeline: [
      { action: 'reported', by: 'u8', at: daysAgo(3), note: 'Wall could collapse anytime' },
      { action: 'validated', by: 'u2', at: daysAgo(2), note: 'Extremely dangerous for pedestrians' },
      { action: 'validated', by: 'u14', at: daysAgo(2), note: 'Cracks are getting wider daily' },
      { action: 'validated', by: 'u1', at: daysAgo(1), note: 'Needs emergency demolition' },
    ],
    imageColor: '#8A7E6B',
    dna: 'DMG-IND-H83-3DL',
  },
  {
    id: 'iss-013', category: 'pothole', title: 'Road cave-in near metro construction',
    description: 'The road has partially caved in near the Jayanagar Metro station construction site. A 4-foot wide sinkhole has appeared. Metal barriers have been placed but are inadequate.',
    severity: 9.3, status: STATUS.IN_PROGRESS, reportedBy: 'u15',
    lat: 12.9290, lng: 77.5830, neighborhood: 'jayanagar',
    landmark: 'Near Jayanagar Metro Station',
    reportedAt: daysAgo(1), updatedAt: hoursAgo(4),
    validators: ['u3', 'u9', 'u1', 'u2', 'u12'], disputes: [],
    swarmConfidence: 0.95, stakeTotal: 82,
    timeline: [
      { action: 'reported', by: 'u15', at: daysAgo(1), note: 'Road caving in! Emergency!' },
      { action: 'validated', by: 'u3', at: daysAgo(1), note: 'Massive sinkhole forming' },
      { action: 'validated', by: 'u9', at: hoursAgo(20), note: 'This is extremely dangerous' },
      { action: 'in_progress', by: 'system', at: hoursAgo(4), note: 'Metro contractor team on site' },
    ],
    imageColor: '#3D3528',
    dna: 'POT-JAY-H93-1DM',
  },
  {
    id: 'iss-014', category: 'water_leak', title: 'Tap water running brown/muddy',
    description: 'Residents on 17th Cross, Malleshwaram have been receiving brown colored water from taps for 3 days. Water smells of mud and is not safe for consumption. BWSSB not responding to complaints.',
    severity: 7.5, status: STATUS.VALIDATED, reportedBy: 'u7',
    lat: 12.9950, lng: 77.5730, neighborhood: 'malleshwaram',
    landmark: '17th Cross Malleshwaram',
    reportedAt: daysAgo(3), updatedAt: daysAgo(1),
    validators: ['u12', 'u15'], disputes: [],
    swarmConfidence: 0.82, stakeTotal: 20,
    timeline: [
      { action: 'reported', by: 'u7', at: daysAgo(3), note: 'Brown water from taps' },
      { action: 'validated', by: 'u12', at: daysAgo(2), note: 'Same issue at my house too' },
      { action: 'validated', by: 'u15', at: daysAgo(1), note: 'Buying bottled water now' },
    ],
    imageColor: '#7B6B4E',
    dna: 'WLK-MAL-H75-3DN',
  },
  {
    id: 'iss-015', category: 'streetlight', title: 'Fallen electric pole after storm',
    description: 'An electric pole has fallen after last night\'s thunderstorm on 100 Feet Road, Koramangala. Live wires are dangling close to the ground. Area cordoned off by residents using makeshift barriers.',
    severity: 9.8, status: STATUS.IN_PROGRESS, reportedBy: 'u13',
    lat: 12.9370, lng: 77.6210, neighborhood: 'koramangala',
    landmark: '100 Feet Road Koramangala',
    reportedAt: hoursAgo(6), updatedAt: hoursAgo(1),
    validators: ['u1', 'u6', 'u2', 'u8', 'u3', 'u4'], disputes: [],
    swarmConfidence: 0.99, stakeTotal: 110,
    timeline: [
      { action: 'reported', by: 'u13', at: hoursAgo(6), note: 'EMERGENCY - Live wires on road!' },
      { action: 'validated', by: 'u1', at: hoursAgo(5), note: 'Life threatening! Stay away!' },
      { action: 'validated', by: 'u6', at: hoursAgo(5), note: 'Called BESCOM emergency' },
      { action: 'in_progress', by: 'system', at: hoursAgo(2), note: 'BESCOM team arrived on site' },
    ],
    imageColor: '#1C1C2D',
    dna: 'STL-KRM-H98-0DO',
  },
  {
    id: 'iss-016', category: 'garbage', title: 'Plastic waste choking lake inlet',
    description: 'Massive amounts of plastic waste have accumulated at the inlet of Agara Lake. The inlet pipe is almost completely blocked. This is causing water stagnation and killing aquatic life.',
    severity: 7.8, status: STATUS.VALIDATED, reportedBy: 'u1',
    lat: 12.9200, lng: 77.6380, neighborhood: 'hsr_layout',
    landmark: 'Agara Lake Inlet',
    reportedAt: daysAgo(4), updatedAt: daysAgo(1),
    validators: ['u5', 'u11', 'u6'], disputes: [],
    swarmConfidence: 0.86, stakeTotal: 30,
    timeline: [
      { action: 'reported', by: 'u1', at: daysAgo(4), note: 'Lake inlet choked with plastic' },
      { action: 'validated', by: 'u5', at: daysAgo(3), note: 'Fish dying in the area' },
      { action: 'validated', by: 'u11', at: daysAgo(2), note: 'This is an ecological disaster' },
      { action: 'validated', by: 'u6', at: daysAgo(1), note: 'Needs NGO + BBMP joint action' },
    ],
    imageColor: '#3D6B4A',
    dna: 'GRB-HSR-H78-4DP',
  },
  {
    id: 'iss-017', category: 'damage', title: 'Bridge railing missing section',
    description: 'A 10-foot section of the bridge railing on Koramangala inner ring road overpass is completely missing. No warning signs placed. Extremely dangerous for two-wheelers and pedestrians.',
    severity: 9.0, status: STATUS.REPORTED, reportedBy: 'u6',
    lat: 12.9380, lng: 77.6250, neighborhood: 'koramangala',
    landmark: 'Koramangala IRR Overpass',
    reportedAt: hoursAgo(12), updatedAt: hoursAgo(12),
    validators: ['u1'], disputes: [],
    swarmConfidence: 0.55, stakeTotal: 12,
    timeline: [
      { action: 'reported', by: 'u6', at: hoursAgo(12), note: 'Bridge railing missing - deadly!' },
      { action: 'validated', by: 'u1', at: hoursAgo(10), note: 'This is life-threatening' },
    ],
    imageColor: '#5A5A5A',
    dna: 'DMG-KRM-H90-0DQ',
  },
  {
    id: 'iss-018', category: 'pothole', title: 'Waterlogged road impossible to pass',
    description: 'The road near Sony Signal, Jayanagar is perpetually waterlogged due to blocked drainage. Vehicles get stuck daily. Auto-rickshaws refuse to go through this route.',
    severity: 6.5, status: STATUS.RESOLVED, reportedBy: 'u9',
    lat: 12.9270, lng: 77.5850, neighborhood: 'jayanagar',
    landmark: 'Sony Signal Jayanagar',
    reportedAt: daysAgo(15), updatedAt: daysAgo(5),
    validators: ['u3', 'u15'], disputes: [],
    swarmConfidence: 0.83, stakeTotal: 18,
    timeline: [
      { action: 'reported', by: 'u9', at: daysAgo(15), note: 'Road permanently waterlogged' },
      { action: 'validated', by: 'u3', at: daysAgo(14), note: 'Drainage blocked for months' },
      { action: 'in_progress', by: 'system', at: daysAgo(8), note: 'Drain clearing initiated' },
      { action: 'resolved', by: 'system', at: daysAgo(5), note: 'Drainage restored, road resurfaced' },
    ],
    imageColor: '#506878',
    dna: 'POT-JAY-H65-FDR',
  },
  {
    id: 'iss-019', category: 'other', title: 'Illegal parking blocking ambulance route',
    description: 'Cars are illegally parked on both sides of the road near Whitefield hospital, reducing it to single lane. Ambulances unable to pass during emergencies. Despite no-parking signs, enforcement is absent.',
    severity: 7.0, status: STATUS.REPORTED, reportedBy: 'u10',
    lat: 12.9710, lng: 77.7480, neighborhood: 'whitefield',
    landmark: 'Near Whitefield Hospital',
    reportedAt: daysAgo(2), updatedAt: daysAgo(2),
    validators: ['u4'], disputes: [],
    swarmConfidence: 0.60, stakeTotal: 10,
    timeline: [
      { action: 'reported', by: 'u10', at: daysAgo(2), note: 'Ambulances cant get through!' },
      { action: 'validated', by: 'u4', at: daysAgo(1), note: 'Witnessed ambulance stuck in traffic' },
    ],
    imageColor: '#6A6A7A',
    dna: 'OTH-WHT-H70-2DS',
  },
  {
    id: 'iss-020', category: 'water_leak', title: 'Overflowing manhole during rain',
    description: 'The manhole cover on 3rd Cross, Koramangala overflows every time it rains. Dirty water enters ground floor houses. The manhole cover is also partially broken and a tripping hazard.',
    severity: 7.0, status: STATUS.VALIDATED, reportedBy: 'u13',
    lat: 12.9345, lng: 77.6230, neighborhood: 'koramangala',
    landmark: '3rd Cross Koramangala',
    reportedAt: daysAgo(6), updatedAt: daysAgo(2),
    validators: ['u1', 'u6'], disputes: [],
    swarmConfidence: 0.79, stakeTotal: 16,
    timeline: [
      { action: 'reported', by: 'u13', at: daysAgo(6), note: 'Manhole overflows during rain' },
      { action: 'validated', by: 'u1', at: daysAgo(5), note: 'Yes, a recurring problem here' },
      { action: 'validated', by: 'u6', at: daysAgo(3), note: 'My house got flooded last rain' },
    ],
    imageColor: '#5B6B5B',
    dna: 'WLK-KRM-H70-6DT',
  },
  {
    id: 'iss-021', category: 'streetlight', title: 'Sparking transformer box',
    description: 'An electrical transformer box near Indiranagar BDA Complex is sparking intermittently. Burning smell noticed by passersby. Potential fire hazard.',
    severity: 9.0, status: STATUS.VALIDATED, reportedBy: 'u2',
    lat: 12.9770, lng: 77.6420, neighborhood: 'indiranagar',
    landmark: 'BDA Complex Indiranagar',
    reportedAt: hoursAgo(18), updatedAt: hoursAgo(6),
    validators: ['u8', 'u14', 'u1'], disputes: [],
    swarmConfidence: 0.91, stakeTotal: 50,
    timeline: [
      { action: 'reported', by: 'u2', at: hoursAgo(18), note: 'Transformer sparking - fire risk!' },
      { action: 'validated', by: 'u8', at: hoursAgo(16), note: 'Confirmed, called BESCOM' },
      { action: 'validated', by: 'u14', at: hoursAgo(12), note: 'Burning smell getting stronger' },
      { action: 'validated', by: 'u1', at: hoursAgo(6), note: 'Still sparking, no response yet' },
    ],
    imageColor: '#FF6633',
    dna: 'STL-IND-H90-0DU',
  },
  {
    id: 'iss-022', category: 'garbage', title: 'Dead animal carcass on roadside',
    description: 'A dead stray dog carcass has been lying on the roadside near HSR Layout Sector 4 park for 3 days. BBMP has not removed it despite multiple calls. Health hazard to children playing in the park.',
    severity: 6.5, status: STATUS.RESOLVED, reportedBy: 'u11',
    lat: 12.9080, lng: 77.6400, neighborhood: 'hsr_layout',
    landmark: 'HSR Sector 4 Park',
    reportedAt: daysAgo(8), updatedAt: daysAgo(4),
    validators: ['u5'], disputes: [],
    swarmConfidence: 0.62, stakeTotal: 8,
    timeline: [
      { action: 'reported', by: 'u11', at: daysAgo(8), note: 'Dead animal needs removal' },
      { action: 'validated', by: 'u5', at: daysAgo(7), note: 'Children play near here' },
      { action: 'in_progress', by: 'system', at: daysAgo(5), note: 'BBMP van scheduled' },
      { action: 'resolved', by: 'system', at: daysAgo(4), note: 'Carcass removed and area sanitized' },
    ],
    imageColor: '#666655',
    dna: 'GRB-HSR-H65-8DV',
  },
  {
    id: 'iss-023', category: 'damage', title: 'Collapsed compound wall after rain',
    description: 'A compound wall of a residential building on 7th Main, Jayanagar collapsed during heavy rain last night. Debris is blocking half the road. No injuries reported but road is partially blocked.',
    severity: 6.8, status: STATUS.IN_PROGRESS, reportedBy: 'u3',
    lat: 12.9300, lng: 77.5810, neighborhood: 'jayanagar',
    landmark: '7th Main Jayanagar',
    reportedAt: daysAgo(1), updatedAt: hoursAgo(8),
    validators: ['u9', 'u15'], disputes: [],
    swarmConfidence: 0.80, stakeTotal: 16,
    timeline: [
      { action: 'reported', by: 'u3', at: daysAgo(1), note: 'Wall collapsed, debris on road' },
      { action: 'validated', by: 'u9', at: hoursAgo(20), note: 'Road partially blocked' },
      { action: 'validated', by: 'u15', at: hoursAgo(16), note: 'Needs debris clearing' },
      { action: 'in_progress', by: 'system', at: hoursAgo(8), note: 'BBMP clearing team dispatched' },
    ],
    imageColor: '#8B7D6B',
    dna: 'DMG-JAY-H68-1DW',
  },
  {
    id: 'iss-024', category: 'other', title: 'Overhanging tree branch on power line',
    description: 'A large tree branch is resting on a high-tension power line on Sampige Road, Malleshwaram. Risk of power line snapping or fire. BESCOM needs to coordinate with BBMP for trimming.',
    severity: 8.0, status: STATUS.REPORTED, reportedBy: 'u12',
    lat: 12.9990, lng: 77.5720, neighborhood: 'malleshwaram',
    landmark: 'Sampige Road Malleshwaram',
    reportedAt: hoursAgo(4), updatedAt: hoursAgo(4),
    validators: [], disputes: [],
    swarmConfidence: 0.0, stakeTotal: 8,
    timeline: [
      { action: 'reported', by: 'u12', at: hoursAgo(4), note: 'Tree on power line - fire risk!' },
    ],
    imageColor: '#2D5A1E',
    dna: 'OTH-MAL-H80-0DX',
  },
  {
    id: 'iss-025', category: 'pothole', title: 'Road surface peeling off in patches',
    description: 'The newly laid road on Lavelle Road, Indiranagar has started peeling off in large patches just 2 months after resurfacing. Clearly substandard material was used. Tax money wasted.',
    severity: 5.8, status: STATUS.REPORTED, reportedBy: 'u14',
    lat: 12.9760, lng: 77.6380, neighborhood: 'indiranagar',
    landmark: 'Lavelle Road Indiranagar',
    reportedAt: daysAgo(2), updatedAt: daysAgo(2),
    validators: ['u2'], disputes: [],
    swarmConfidence: 0.55, stakeTotal: 6,
    timeline: [
      { action: 'reported', by: 'u14', at: daysAgo(2), note: 'New road already peeling off!' },
      { action: 'validated', by: 'u2', at: daysAgo(1), note: 'Corruption? Just 2 months old' },
    ],
    imageColor: '#4A4A38',
    dna: 'POT-IND-H58-2DY',
  },
];

const quests = [
  { id: 'q1', title: 'The Pothole Slayer', icon: 'Sword', description: 'Report 5 road damage issues to earn the Pothole Slayer badge', category: 'pothole', target: 5, progress: 3, xpReward: 200, pointsReward: 50, type: 'report', active: true },
  { id: 'q2', title: 'Water Guardian', icon: 'Shield', description: 'Validate 3 water-related issues to become a Water Guardian', category: 'water_leak', target: 3, progress: 1, xpReward: 150, pointsReward: 35, type: 'validate', active: true },
  { id: 'q3', title: 'Night Watch', icon: 'Moon', description: 'Report 3 issues after 8 PM to earn the Night Watch badge', category: null, target: 3, progress: 0, xpReward: 250, pointsReward: 60, type: 'night_report', active: true },
  { id: 'q4', title: 'First Responder', icon: 'Zap', description: 'Be the first to validate 5 newly reported issues', category: null, target: 5, progress: 2, xpReward: 300, pointsReward: 75, type: 'first_validate', active: true },
  { id: 'q5', title: 'Community Raid Boss', icon: 'Users', description: 'Get 10+ citizens to validate a single critical issue you reported', category: null, target: 1, progress: 0, xpReward: 500, pointsReward: 120, type: 'raid', active: true },
  { id: 'q6', title: 'The Clean Crusader', icon: 'Trash2', description: 'Report 3 garbage/waste issues to earn the Clean Crusader badge', category: 'garbage', target: 3, progress: 2, xpReward: 150, pointsReward: 35, type: 'report', active: true },
  { id: 'q7', title: 'Infrastructure Inspector', icon: 'Search', description: 'Validate 5 infrastructure damage issues', category: 'damage', target: 5, progress: 4, xpReward: 200, pointsReward: 50, type: 'validate', active: true },
  { id: 'q8', title: 'Streak Master', icon: 'Flame', description: 'Report at least 1 issue every day for 7 consecutive days', category: null, target: 7, progress: 4, xpReward: 400, pointsReward: 100, type: 'streak', active: true },
];

const achievements = [
  { id: 'a1', title: 'First Report', icon: 'Target', description: 'Report your first community issue', unlocked: true, unlockedAt: daysAgo(60) },
  { id: 'a2', title: 'Sharp Eye', icon: 'Eye', description: 'Report 10 issues', unlocked: true, unlockedAt: daysAgo(30) },
  { id: 'a3', title: 'Watchdog', icon: 'Shield', description: 'Validate 25 issues', unlocked: true, unlockedAt: daysAgo(20) },
  { id: 'a4', title: 'Guardian Angel', icon: 'CheckCircle', description: 'Help resolve 10 issues', unlocked: true, unlockedAt: daysAgo(15) },
  { id: 'a5', title: 'Pothole Hunter', icon: 'AlertTriangle', description: 'Report 5 pothole issues', unlocked: true, unlockedAt: daysAgo(25) },
  { id: 'a6', title: 'Water Warrior', icon: 'Droplets', description: 'Report 3 water-related issues', unlocked: false, unlockedAt: null },
  { id: 'a7', title: 'Night Owl', icon: 'Moon', description: 'Report an issue after midnight', unlocked: false, unlockedAt: null },
  { id: 'a8', title: 'Centurion', icon: 'Award', description: 'Reach 100 Shield Points', unlocked: true, unlockedAt: daysAgo(10) },
  { id: 'a9', title: 'Neighborhood Hero', icon: 'UserCheck', description: 'Reach Level 10', unlocked: true, unlockedAt: daysAgo(8) },
  { id: 'a10', title: 'Legend of the City', icon: 'Star', description: 'Reach Level 20', unlocked: false, unlockedAt: null },
  { id: 'a11', title: 'Rally Master', icon: 'Megaphone', description: 'Get 5+ validators on a single issue', unlocked: true, unlockedAt: daysAgo(5) },
  { id: 'a12', title: 'Perfect Accuracy', icon: 'Crosshair', description: 'Maintain 95%+ validation accuracy', unlocked: false, unlockedAt: null },
];

function generateVitalsHistory() {
  const neighborhoods = ['koramangala', 'indiranagar', 'jayanagar', 'whitefield', 'hsr_layout', 'malleshwaram'];
  const history = {};
  neighborhoods.forEach(n => {
    history[n] = [];
    for (let i = 30; i >= 0; i--) {
      const base = {
        infrastructure: 55 + Math.random() * 30,
        safety: 60 + Math.random() * 25,
        cleanliness: 50 + Math.random() * 35,
        responseSpeed: 40 + Math.random() * 40,
      };
      // Add some trends
      if (i < 10) {
        base.infrastructure += 5;
        base.responseSpeed += 8;
      }
      history[n].push({
        date: daysAgo(i),
        ...Object.fromEntries(Object.entries(base).map(([k, v]) => [k, Math.min(100, Math.max(0, Math.round(v)))])),
      });
    }
  });
  return history;
}

export const seedData = {
  issues: issues.map(i => ({ ...i, upvotes: Math.floor(Math.random() * 15) + 2, upvotedBy: ['u1', 'u2'], comments: [] })),
  users: [
    { id: 'u-admin-001', name: 'System Admin', avatar: 'ShieldCheck', email: 'admin@nagrik.in', password: 'admin123', avatarSeed: 99, friends: [], level: 99, xp: 99999, shieldPoints: 9999, issuesReported: 0, issuesValidated: 0, accuracy: 1.0, neighborhood: 'bbmp_hq', joinedAt: daysAgo(365), title: 'Administrator', role: 'admin', notifications: [] },
    ...users.map(u => ({ ...u, notifications: [] }))
  ],
  quests,
  achievements,
  vitalsHistory: [{ id: 'main', ...generateVitalsHistory() }],
};

export { CATEGORIES, STATUS, NEIGHBORHOODS };
export default seedData;
