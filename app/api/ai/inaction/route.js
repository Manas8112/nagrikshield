import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { title, description, category, severity } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const prompt = `You are a civic financial and environmental analyst AI. 
Analyze the following civic issue:
Title: ${title}
Description: ${description}
Category: ${category}
Severity: ${severity}/10

Estimate the "Cost of Inaction" if this issue is ignored. Give realistic but impactful estimates.
Return EXACTLY a JSON object with these three keys (and nothing else):
{
  "dailyImpact": "Short string using Indian Rupees (₹), e.g. '₹500/day in vehicle damage' or '1,500 liters/day wasted'",
  "monthlyProjection": "Short string using Indian Rupees (₹), e.g. '₹15,000 total damages' or 'Potential road collapse'",
  "summaryText": "One punchy sentence summarizing why this must be fixed immediately."
}`;

    const payload = {
      model: "gemma3:4b",
      prompt: prompt,
      stream: false,
      format: "json"
    };

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Ollama API responded with status ${response.status}`);
    }

    const data = await response.json();
    let resultJson;
    try {
      resultJson = JSON.parse(data.response.trim());
    } catch (e) {
      console.error("Failed to parse LLM JSON:", data.response);
      // Fallback
      resultJson = {
        dailyImpact: "Unknown daily cost",
        monthlyProjection: "Uncalculated long-term impact",
        summaryText: "This issue poses a continuous degradation risk to the neighborhood."
      };
    }

    return NextResponse.json(resultJson);

  } catch (error) {
    console.error('Cost of Inaction API Error:', error);
    return NextResponse.json({ 
      dailyImpact: "Unknown", 
      monthlyProjection: "Unknown", 
      summaryText: "Could not calculate the cost of inaction at this time." 
    }, { status: 200 });
  }
}
