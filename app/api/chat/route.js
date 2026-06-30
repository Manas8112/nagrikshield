import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { getCascadeTree, getTotalCascadeRisk, getPreventionSavings } from '../../lib/cascadeEngine';
import { CATEGORIES } from '../../lib/seedData';
import { getVisionPipeline } from '../../lib/visionServer';
import { getIssues, getUsers, addFeedback } from '../../lib/storage';
import fs from 'fs';
import crypto from 'crypto';

// Helper to connect to persistent ML Flask API
async function runPythonML(message, liveContext = "", history = []) {
  try {
    const res = await fetch('http://localhost:5001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, live_context: liveContext, history })
    });
    
    if (!res.ok) {
      throw new Error(`Flask API returned ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.warn("Flask ML Server unreachable (Cloud Mode activated):", error.message);
    const lower = message.toLowerCase();
    
    if (lower.includes('report') || lower.includes('pothole') || lower.includes('leak')) return { intent: 'REPORT_ISSUE', category: null };
    if (lower.includes('xp') || lower.includes('level')) return { intent: 'ECONOMY_XP', category: null };
    if (lower.includes('sp') || lower.includes('stake') || lower.includes('point')) return { intent: 'ECONOMY_SP', category: null };
    if (lower.includes('swarm') || lower.includes('validate')) return { intent: 'SWARM_VALIDATION', category: null };
    if (lower.includes('cascade')) return { intent: 'CASCADE_ROI', category: null };
    if (lower.includes('hi') || lower.includes('hello')) return { intent: 'GREETING', category: null };
    
    return {
      intent: 'LLM_GENERATED',
      category: null,
      text: "*(Cloud Fallback Mode)*: I am the CivicTech Command Assistant. The local GPU processing node is offline in this cloud environment, but I am still here to help! Try asking me about Swarm Validation, Cascade ROI, or how to report an issue."
    };
  }
}

export async function POST(req) {
  try {
    const { message, userContext, image, history } = await req.json();

    if (!message && !image) {
      return NextResponse.json({ error: 'Message or image is required' }, { status: 400 });
    }

    let finalMessage = message || '';
    let liveDBContext = '';
    const lowerInput = finalMessage.toLowerCase();

    // Build Live Database Context for the LLM
    try {
      const allIssues = await getIssues();
      const allUsers = await getUsers();
      const activeIssues = allIssues.filter(i => i.status !== 'resolved');
      const resolvedCount = allIssues.length - activeIssues.length;
      
      // Dynamic Intent Engine: Only inject what is needed!
      liveDBContext += `[PLATFORM STATISTICS]\nTotal Users: ${allUsers.length} | Total Reports: ${allIssues.length} | Resolved Reports: ${resolvedCount} | Active Reports: ${activeIssues.length}\n`;

      // Leaderboard Intent
      if (lowerInput.includes('top') || lowerInput.includes('leaderboard') || lowerInput.includes('stats') || lowerInput.includes('best')) {
        const topUsers = [...allUsers].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5);
        liveDBContext += `\n[TOP 5 USERS LEADERBOARD]\n` + topUsers.map((u, i) => `${i+1}. ${u.name} (Level ${u.level || 1}, ${u.xp || 0} XP, ${u.shieldPoints || 0} SP)`).join('\n') + `\n`;
      }

      // Recent Issues Intent
      if (lowerInput.includes('report') || lowerInput.includes('problem') || lowerInput.includes('issue') || lowerInput.includes('where') || lowerInput.includes('time') || lowerInput.includes('location')) {
        const recent = [...activeIssues].sort((a,b) => new Date(b.reportedAt) - new Date(a.reportedAt)).slice(0, 5);
        liveDBContext += `\n[RECENT ACTIVE REPORTS (Top 5)]\n` + recent.map(i => {
          const reporter = allUsers.find(u => u.id === i.reportedBy)?.name || 'Unknown';
          return `- "${i.title}" (${i.category}) reported by ${reporter} near ${i.landmark}, ${i.neighborhood}. Severity: ${i.severity}/10. Status: ${i.status}`;
        }).join('\n') + `\n`;
      }

      // Admins / Department Head Intent
      if (lowerInput.includes('admin') || lowerInput.includes('head') || lowerInput.includes('leader') || lowerInput.includes('who')) {
        const heads = allUsers.filter(u => u.role === 'admin' || u.role === 'department_head');
        liveDBContext += `\n[CITY LEADERS]\n` + heads.map(u => `- ${u.name} (Role: ${u.role})`).join('\n') + `\n`;
      }

      // User Identity Intent
      if (userContext && userContext.name) {
        liveDBContext += `\n[CURRENT USER IDENTITY]\nYou are currently talking to: ${userContext.name} (Role: ${userContext.role}, Level: ${userContext.level || 1}). Address them respectfully!\n`;
      }

    } catch (e) {
      console.error("Failed to load live DB context", e);
    }

    // If there is an image, we query the new internal Vision API
    if (image) {
      const classifier = await getVisionPipeline();
      const prompts = [
        'a dangerous pothole or crater on a city road',
        'water leaking from a broken pipe or flooded street',
        'a pile of garbage or illegal trash dumping',
        'a broken or unlit streetlight',
        'a photo of a clean, normal street'
      ];
      
      let imgInput = image;
      let tempFilePath = null;
      if (image.startsWith('data:')) {
        const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const tempDir = path.join(process.cwd(), '.temp_vision');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        tempFilePath = path.join(tempDir, `img_${crypto.randomUUID()}.jpg`);
        fs.writeFileSync(tempFilePath, buffer);
        imgInput = tempFilePath;
      }

      const output = await classifier(imgInput, prompts);
      
      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      const topMatch = output[0];
      let visualDetection = 'an unknown issue';
      let matchedCategoryId = null;
      if (topMatch.label.includes('pothole')) { visualDetection = 'road and pothole'; matchedCategoryId = 'pothole'; }
      else if (topMatch.label.includes('water')) { visualDetection = 'water leak and flooding'; matchedCategoryId = 'water_leak'; }
      else if (topMatch.label.includes('garbage')) { visualDetection = 'garbage and waste'; matchedCategoryId = 'garbage'; }
      else if (topMatch.label.includes('streetlight')) { visualDetection = 'streetlight failure'; matchedCategoryId = 'streetlight'; }
      else if (topMatch.label.includes('normal')) { visualDetection = 'normal street'; matchedCategoryId = null; }

      // ---------------------------------------------------------
      // DUPLICATE DETECTION ENGINE
      // Search DB for existing issues with the same category
      // ---------------------------------------------------------
      let duplicateContext = '';
      if (matchedCategoryId) {
        try {
          const allIssues = await getIssues();
          const allUsers = await getUsers();
          const matchingIssues = allIssues
            .filter(i => i.category === matchedCategoryId && i.status !== 'resolved')
            .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))
            .slice(0, 5);
          
          if (matchingIssues.length > 0) {
            const issueList = matchingIssues.map(issue => {
              const reporter = allUsers.find(u => u.id === issue.reportedBy);
              const reporterName = reporter?.name || 'Unknown User';
              const dateStr = new Date(issue.reportedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              return `- "${issue.title}" reported by **${reporterName}** on ${dateStr} near ${issue.landmark || issue.neighborhood}. Severity: ${issue.severity}/10. Status: ${issue.status}. [View Issue](/issue/${issue.id})`;
            }).join('\n');
            
            duplicateContext = `\n\n[DUPLICATE DETECTION RESULTS]\nFound ${matchingIssues.length} existing ${visualDetection} report(s) that may match this image:\n${issueList}\n\nINSTRUCTION: Tell the user "I found ${matchingIssues.length} similar ${visualDetection} report(s) already on the platform!" and list each one with the reporter name, date, and the clickable link. Then say: "If none of these match your exact location, you can still report it as a new issue using the link below."`;
          } else {
            duplicateContext = `\n\n[DUPLICATE DETECTION RESULTS]\nNo existing reports found matching this ${visualDetection} category.\nINSTRUCTION: Tell the user "This appears to be a NEW unreported ${visualDetection} issue! No similar reports found on the platform." and encourage them to be the first to report it.`;
          }
        } catch (e) {
          console.error("Duplicate detection failed:", e);
        }
      }

      finalMessage += `\n[SYSTEM: The user uploaded an image. Vision AI categorizes it as: ${visualDetection} (confidence: ${(topMatch.score * 100).toFixed(1)}%).${duplicateContext}]`;
    }

    // Call ML Model
    const mlResponse = await runPythonML(finalMessage, liveDBContext, history || []);
    const { intent, category } = mlResponse;

    let responseText = '';
    let actions = [];

    // Construct response based on AI predicted intent
    if (intent === 'LLM_GENERATED') {
      responseText = mlResponse.text || "I'm processing your civic query using our custom LLM...";
      
      if (responseText.includes('[INTENT: FEEDBACK]')) {
        responseText = responseText.replace('[INTENT: FEEDBACK]', '').trim();
        // Save feedback
        const fbUserId = userContext ? userContext.id : 'anonymous';
        const fbUserName = userContext ? userContext.name : 'Anonymous';
        await addFeedback({ userId: fbUserId, userName: fbUserName, message: finalMessage });
        responseText += "\n\n*(System Note: I've successfully submitted your feature request to the Admins!)*";
      }

      // Dynamically map LLM conversational context to interactive UI actions
      const lowerInput = finalMessage.toLowerCase();
      if (lowerInput.includes('report') || lowerInput.includes('found') || lowerInput.includes('pothole') || lowerInput.includes('leak')) {
        actions.push({ label: 'Open Reporting Tool', href: '/report' });
      }
      if (lowerInput.includes('map') || lowerInput.includes('validate') || lowerInput.includes('swarm')) {
        actions.push({ label: 'View Live Map', href: '/map' });
      }
      if (lowerInput.includes('profile') || lowerInput.includes('xp') || lowerInput.includes('sp')) {
        actions.push({ label: 'Go to Profile', href: '/profile' });
      }
    } else {
      switch (intent) {
        case 'GREETING':
          responseText = `Hello${userContext ? ` ${userContext.name.split(' ')[0]}` : ''}. I am the CivicTech Command Assistant. I can help you report issues, understand our predictive Cascade AI, or explain the Shield Point economy. How can I assist?`;
          break;
        
      case 'REPORT_ISSUE':
        if (category) {
          const catData = CATEGORIES[category];
          const risk = getTotalCascadeRisk(catData.id);
          responseText = `I detected you want to report a **${catData.label}**. Our Cascade Engine predicts that unresolved ${catData.label.toLowerCase()}s have a **${risk}% risk** of causing secondary damages within weeks.`;
          actions = [{ label: 'Report Issue Now', href: '/report' }];
        } else {
          responseText = "I can help you report an issue. We track Potholes, Water Leaks, Garbage Dumps, and Streetlight failures. What did you find?";
          actions = [{ label: 'Open Reporting Tool', href: '/report' }];
        }
        break;

      case 'CASCADE_ROI':
        if (category) {
          const catData = CATEGORIES[category];
          const savings = getPreventionSavings(catData.id, 8);
          responseText = `The Cascade ROI for **${catData.label}s**: Fixing it now costs ~${savings.fixNow}, but if left to cascade into secondary failures, it will cost the city ~${savings.ifCascades}. Fixing it early provides a **${savings.savingsMultiplier} ROI**.`;
        } else {
          responseText = "The Cascade Engine is our predictive model. It calculates the financial and civic cost of *not* fixing an issue today. It identifies how a simple water leak turns into a massive pothole over 3 weeks. Mention a specific issue type (like 'pothole') and I'll give you the exact prediction.";
          actions = [{ label: 'View Cascade Engine', href: '/cascade' }];
        }
        break;

      case 'ECONOMY_SP':
        responseText = "Shield Points (SP) are your civic stake. When you report an issue, SP is staked. Once the government resolves the issue and the AI verifies the fix, your SP is returned with a multiplier bonus. If you submit a fake report, you lose your stake.";
        break;

      case 'ECONOMY_XP':
        if (userContext) {
          responseText = `You currently are **Level ${userContext.level}** with **${userContext.xp} XP**. You can earn more XP by navigating to the Live Map and acting as a 'Swarm Validator' for nearby issues!`;
          actions = [{ label: 'View Live Map', href: '/map' }];
        } else {
          responseText = "Experience Points (XP) track your overall civic impact. You earn XP for reporting, validating, and completing Quests. Earn enough XP to level up from Scout to Legend.";
        }
        break;

      case 'SWARM_VALIDATION':
        responseText = "Swarm Validation is our anti-spam mechanism. A single report is unverified. We require multiple citizens in the geographic radius to validate the report. Once the Swarm Confidence hits 85%, it gets pushed directly to the government dispatch board.";
        break;

      case 'CHECK_STATUS':
        if (userContext) {
          responseText = "You can track the live status of your reports directly from your Profile Dashboard.";
          actions = [{ label: 'Go to Profile', href: '/profile' }];
        } else {
          responseText = "To check the status of your reports, please log in. You will also receive real-time notifications when the government dispatches a team.";
        }
        break;

      case 'AI_SYSTEM':
        responseText = "The platform uses a 4-Layer Fusion AI: 1) Semantic CNN for categorization, 2) Pixel Math for depth/severity heuristics, 3) Geo-Temporal risk multipliers, and 4) The Fusion Matrix which outputs a unique 'Issue DNA'.";
        actions = [{ label: 'Read Tech Stack Guide', href: '/guide' }];
        break;

        default:
          responseText = "I'm a specially trained Civic Assistant. I can explain the AI Pipeline (Cascade ROI, Swarm Validation), help you report an issue, or explain your XP/SP stats. Try asking about 'Cascade Risk for Potholes'!";
      }
    }

    return NextResponse.json({ text: responseText, actions, intent, category });

  } catch (error) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
