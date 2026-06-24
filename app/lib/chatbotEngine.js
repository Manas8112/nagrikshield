import { getCascadeTree, getTotalCascadeRisk, getPreventionSavings } from './cascadeEngine';
import { CATEGORIES } from './seedData';

// Custom NLP Chatbot Engine built from scratch for CivicTech Command

// 1. Intent Definitions
const INTENTS = {
  GREETING: ['hi', 'hello', 'hey', 'start', 'help'],
  REPORT_ISSUE: ['report', 'complain', 'found', 'broken', 'leak', 'pothole', 'garbage', 'trash', 'dark', 'light'],
  CHECK_STATUS: ['status', 'my report', 'fixed', 'resolved', 'progress'],
  ECONOMY_SP: ['sp', 'shield points', 'stake', 'currency', 'points'],
  ECONOMY_XP: ['xp', 'level', 'experience', 'rank', 'badge'],
  CASCADE_ROI: ['cascade', 'roi', 'future', 'prediction', 'cost', 'savings'],
  SWARM_VALIDATION: ['swarm', 'validate', 'verify', 'community'],
  AI_SYSTEM: ['ai', 'engine', 'how does it work', 'fusion', 'dna'],
};

// 2. Entity Extraction
function extractCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('pothole') || lower.includes('road')) return 'POTHOLE';
  if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe')) return 'WATER_LEAK';
  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste')) return 'GARBAGE';
  if (lower.includes('light') || lower.includes('lamp') || lower.includes('dark')) return 'STREETLIGHT';
  return null;
}

// 3. Intent Classifier
function classifyIntent(text) {
  const lower = text.toLowerCase();
  
  let maxMatches = 0;
  let bestIntent = 'UNKNOWN';

  for (const [intent, keywords] of Object.entries(INTENTS)) {
    const matches = keywords.filter(kw => lower.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestIntent = intent;
    }
  }
  
  return bestIntent;
}

// 4. Response Generator
export async function processChat(message, userContext = null) {
  const intent = classifyIntent(message);
  const category = extractCategory(message);
  
  // Delay slightly to simulate processing (gives a natural feel)
  await new Promise(r => setTimeout(r, 600));

  let response = '';
  let actions = [];

  switch (intent) {
    case 'GREETING':
      response = `Hello${userContext ? ` ${userContext.name.split(' ')[0]}` : ''}. I am the CivicTech Command Assistant. I can help you report issues, understand our predictive Cascade AI, or explain the Shield Point economy. How can I assist?`;
      break;
      
    case 'REPORT_ISSUE':
      if (category) {
        const catData = CATEGORIES[category];
        const risk = getTotalCascadeRisk(catData.id);
        response = `I detected you want to report a **${catData.label}**. Our Cascade Engine predicts that unresolved ${catData.label.toLowerCase()}s have a **${risk}% risk** of causing secondary damages within weeks.`;
        actions = [{ label: 'Report Issue Now', href: '/report' }];
      } else {
        response = "I can help you report an issue. We track Potholes, Water Leaks, Garbage Dumps, and Streetlight failures. What did you find?";
        actions = [{ label: 'Open Reporting Tool', href: '/report' }];
      }
      break;

    case 'CASCADE_ROI':
      if (category) {
        const catData = CATEGORIES[category];
        const savings = getPreventionSavings(catData.id, 8);
        response = `The Cascade ROI for **${catData.label}s**: Fixing it now costs ~${savings.fixNow}, but if left to cascade into secondary failures, it will cost the city ~${savings.ifCascades}. Fixing it early provides a **${savings.savingsMultiplier} ROI**.`;
      } else {
        response = "The Cascade Engine is our predictive model. It calculates the financial and civic cost of *not* fixing an issue today. It identifies how a simple water leak turns into a massive pothole over 3 weeks. Mention a specific issue type (like 'pothole') and I'll give you the exact prediction.";
        actions = [{ label: 'View Cascade Engine', href: '/cascade' }];
      }
      break;

    case 'ECONOMY_SP':
      response = "Shield Points (SP) are your civic stake. When you report an issue, SP is staked. Once the government resolves the issue and the AI verifies the fix, your SP is returned with a multiplier bonus. If you submit a fake report, you lose your stake.";
      break;

    case 'ECONOMY_XP':
      if (userContext) {
        response = `You currently are **Level ${userContext.level}** with **${userContext.xp} XP**. You can earn more XP by navigating to the Live Map and acting as a 'Swarm Validator' for nearby issues!`;
        actions = [{ label: 'View Live Map', href: '/map' }];
      } else {
        response = "Experience Points (XP) track your overall civic impact. You earn XP for reporting, validating, and completing Quests. Earn enough XP to level up from Scout to Legend.";
      }
      break;

    case 'SWARM_VALIDATION':
      response = "Swarm Validation is our anti-spam mechanism. A single report is unverified. We require multiple citizens in the geographic radius to validate the report. Once the Swarm Confidence hits 85%, it gets pushed directly to the government dispatch board.";
      break;

    case 'CHECK_STATUS':
      if (userContext) {
        response = "You can track the live status of your reported and validated issues directly from your Profile Dashboard.";
        actions = [{ label: 'Go to Profile', href: '/profile' }];
      } else {
        response = "To check the status of your reports, please log in. You will also receive real-time notifications when the government dispatches a team.";
      }
      break;

    case 'AI_SYSTEM':
      response = "The platform uses a 4-Layer Fusion AI: 1) Semantic CNN for categorization, 2) Pixel Math for depth/severity heuristics, 3) Geo-Temporal risk multipliers, and 4) The Fusion Matrix which outputs a unique 'Issue DNA'.";
      actions = [{ label: 'Read Tech Stack Guide', href: '/guide' }];
      break;

    default:
      response = "I'm a specially trained Civic Assistant. I can explain the AI Pipeline (Cascade ROI, Swarm Validation), help you report an issue, or explain your XP/SP stats. Try asking about 'Cascade Risk for Potholes'!";
  }

  return { text: response, actions };
}
