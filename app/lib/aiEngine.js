import * as tf from '@tensorflow/tfjs';

// ==========================================
// LAYER 1: Semantic Embeddings (Server-Side CLIP API)
// ==========================================
export async function extractSemanticFeatures(imgElement) {
  // Extract data URL from image element
  let imageDataUrl;
  if (imgElement.src && imgElement.src.startsWith('data:')) {
    imageDataUrl = imgElement.src;
  } else {
    // If it's a DOM Image without a data URL, we draw it to a canvas to get base64
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.width || 224;
    canvas.height = imgElement.height || 224;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    imageDataUrl = canvas.toDataURL('image/jpeg');
  }

  // Define prompts targeting specific civic issues using standard CLIP 'a photo of' prefix
  const categoryPrompts = [
    'a photo of a pothole on a street',
    'a photo of a water leak or flooding',
    'a photo of garbage or trash dumped',
    'a photo of a streetlight',
    'a photo of a clean, normal street'
  ];

  const severityPrompts = [
    'a photo of severe damage and destruction',
    'a photo of moderate damage',
    'a photo of minor cosmetic damage'
  ];

  try {
    const res = await fetch('/api/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl, prompts: [...categoryPrompts, ...severityPrompts] })
    });

    if (!res.ok) throw new Error('Vision API failed');
    const { result } = await res.json();
    
    // Separate results back into categories and severities based on prompts
    const catResults = result.filter(r => categoryPrompts.includes(r.label)).sort((a, b) => b.score - a.score);
    const sevResults = result.filter(r => severityPrompts.includes(r.label)).sort((a, b) => b.score - a.score);
    
    const topMatch = catResults[0];
    let baseCategory = 'OTHER';

    if (topMatch.label.includes('pothole')) baseCategory = 'POTHOLE';
    else if (topMatch.label.includes('water')) baseCategory = 'WATER_LEAK';
    else if (topMatch.label.includes('garbage')) baseCategory = 'WASTE';
    else if (topMatch.label.includes('streetlight')) baseCategory = 'STREETLIGHT';

    // Calculate dynamic severity out of 10 based on top severity match
    let visualSeverity = 5.0;
    if (sevResults[0]?.label.includes('severe')) visualSeverity = 8.5;
    else if (sevResults[0]?.label.includes('moderate')) visualSeverity = 5.5;
    else if (sevResults[0]?.label.includes('minor')) visualSeverity = 2.5;

    return { 
      tags: catResults, 
      baseCategory, 
      semanticConfidence: topMatch.score,
      visualSeverity 
    };

  } catch (error) {
    console.error('CLIP API Error:', error);
    // Fallback to OTHER if the server fails
    return { tags: [], baseCategory: 'OTHER', semanticConfidence: 0.1, visualSeverity: 5.0 };
  }
}

// ==========================================
// LAYER 2: Algorithmic Computer Vision (Pixel Math)
// ==========================================
function extractPixelHeuristics(imgElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 224; // Standardized size for speed
  canvas.height = 224;
  ctx.drawImage(imgElement, 0, 0, 224, 224);
  const imageData = ctx.getImageData(0, 0, 224, 224).data;

  let edgeCount = 0;
  let rSum = 0, gSum = 0, bSum = 0;
  let darkPixelCount = 0; // For depth/shadow estimation

  // Simple edge detection & chromatic analysis pass
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    
    rSum += r; gSum += g; bSum += b;

    const brightness = (r + g + b) / 3;
    if (brightness < 40) darkPixelCount++;

    // Naive horizontal edge detection (compare with right pixel)
    if (i % (224 * 4) < (224 - 1) * 4) {
      const rightBrightness = (imageData[i+4] + imageData[i+5] + imageData[i+6]) / 3;
      if (Math.abs(brightness - rightBrightness) > 30) {
        edgeCount++;
      }
    }
  }

  const totalPixels = 224 * 224;
  
  // 1. Edge Density: High density = severe disruption (e.g., fractured asphalt)
  const edgeDensity = edgeCount / totalPixels;
  
  // 2. Chromatic Shift: High blue/green = water, High red/orange = rust/clay
  const rAvg = rSum / totalPixels;
  const gAvg = gSum / totalPixels;
  const bAvg = bSum / totalPixels;
  const isWaterSignature = bAvg > rAvg + 20 && bAvg > gAvg + 10;
  const isRustSignature = rAvg > gAvg + 40 && rAvg > bAvg + 40;

  // 3. Luminance Depth: Severe dark contrast implies a deep physical hole
  const depthRatio = darkPixelCount / totalPixels;

  return { edgeDensity, depthRatio, isWaterSignature, isRustSignature };
}

// ==========================================
// LAYER 3: Geo-Temporal Risk Engine
// ==========================================
function calculateGeoTemporalRisk(lat, lng) {
  const currentHour = new Date().getHours();
  
  // Time Multiplier: Issues are 30% more dangerous at night (18:00 - 06:00)
  const isNight = currentHour >= 18 || currentHour <= 6;
  const timeMultiplier = isNight ? 1.3 : 1.0;

  // Zone Multiplier: Proximity to major junctions (Simulated Koramangala coordinate)
  const distToJunction = Math.sqrt(Math.pow(lat - 12.9352, 2) + Math.pow(lng - 77.6245, 2));
  const zoneMultiplier = distToJunction < 0.01 ? 1.2 : 1.0; // Boost if within ~1km

  return { timeMultiplier, zoneMultiplier, isNight };
}

// ==========================================
// LAYER 4: The Fusion Matrix
// ==========================================
class FusionMatrix {
  static compute(semantic, pixels, geo, userCategory) {
    let category = semantic.baseCategory;
    let confidence = semantic.semanticConfidence;
    let severity = semantic.visualSeverity || 5.0; 

    // Fallback: If AI is very uncertain, trust the human's category.
    if (confidence < 0.3 && userCategory) {
      category = userCategory.toUpperCase();
      confidence = 0.5; // Artificial baseline for human override
    }

    // Fusion: Override CNN if pixel heuristics strongly disagree
    if (category === 'OTHER' || confidence < 0.4) {
      if (pixels.isWaterSignature && pixels.edgeDensity < 0.1) category = 'WATER_LEAK';
      if (pixels.edgeDensity > 0.15) category = 'POTHOLE';
    }

    // Fusion: Calculate true severity using all modalities
    // Base weight from CNN
    let rawSeverity = confidence * 5; 

    // Add Pixel Math weights
    if (category === 'POTHOLE') {
      rawSeverity += (pixels.edgeDensity * 20); // High edges = very broken
      rawSeverity += (pixels.depthRatio * 30);  // High shadows = deep hole
    } else if (category === 'WATER_LEAK') {
      rawSeverity += pixels.isRustSignature ? 3 : 1; // Rusty water is a worse pipe burst
    }

    // Apply Geo-Temporal Multipliers
    rawSeverity = rawSeverity * geo.timeMultiplier * geo.zoneMultiplier;

    // Normalize to 1.0 - 10.0 scale
    severity = Math.max(1.0, Math.min(10.0, rawSeverity));

    return {
      category,
      severity,
      confidence: Math.min(0.99, confidence + (pixels.edgeDensity > 0.1 ? 0.1 : 0)),
      matrixDetails: { semantic, pixels, geo }
    };
  }
}

// ==========================================
// MAIN EXPORT
// ==========================================
export async function runFusionPipeline(imgElement, location, userCategory) {
  // 1. CNN
  const semantic = await extractSemanticFeatures(imgElement);
  
  // 2. Pixels
  const pixels = extractPixelHeuristics(imgElement);
  
  // 3. Context
  const geo = calculateGeoTemporalRisk(location.lat, location.lng);
  
  // 4. Fusion
  const finalResult = FusionMatrix.compute(semantic, pixels, geo, userCategory);
  
  return finalResult;
}
