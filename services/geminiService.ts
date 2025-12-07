import { GoogleGenAI } from "@google/genai";
import { FullPredictionData, MatchIntelligence } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGeminiAnalysis = async (match: FullPredictionData, intel: MatchIntelligence): Promise<string> => {
    
    // Process Intelligence Data for Prompt
    const h2hText = intel.h2h.slice(0, 5).map((m: any) => 
        `${m.teams.home.name} ${m.goals.home}-${m.goals.away} ${m.teams.away.name} (${new Date(m.fixture.date).getFullYear()})`
    ).join('\n');

    const injuriesText = intel.injuries.length > 0 
        ? intel.injuries.map((i: any) => `${i.player.name} (${i.team.name}): ${i.type}`).join(', ')
        : "No major injuries reported via API.";

    const advice = intel.predictions.predictions?.advice || "No specific advice";
    const winnerProb = intel.predictions.predictions?.percent || { home: '?', draw: '?', away: '?' };

    const prompt = `
        Act as a World-Class Professional Football Analyst.
        
        Analyze the following match data for: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.league}).
        
        DATA POINTS:
        1. FORM (Last 5): Home: ${intel.form.home}, Away: ${intel.form.away}
        2. H2H (Last 5 Meetings):
        ${h2hText}
        3. INJURIES:
        ${injuriesText}
        4. API STATS:
        Advice: ${advice}
        Probabilities: Home ${winnerProb.home}, Draw ${winnerProb.draw}, Away ${winnerProb.away}
        5. ODDS:
        Home ~${match.prediction.odds}, Implied Market Confidence.

        INSTRUCTIONS:
        - Write a 5-7 sentence in-depth analysis.
        - Focus on form, head-to-head dominance, and critical player absences if any.
        - Use professional football terminology.
        - END the response with a standalone line: "BEST VALUE BET: [Your Bet]"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "Analysis currently unavailable due to high demand. Please rely on the statistics provided.";
    }
};