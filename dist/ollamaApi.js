"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaApi = void 0;
class OllamaApi {
    constructor() {
        this.baseUrl = 'http://localhost:11434/api/generate';
    }
    async analyzeCurrentPlay(mood, availableGames) {
        const prompt = `
You are an expert gaming psychologist and recommendation AI. Analyze the user's current gaming session and mood to understand their preferences.

Current Mood: ${mood}
Available Games: ${availableGames.map(g => g.title).join(', ')}

Please analyze and provide:
1. Current energy level (low/medium/high)
2. Preferred play style (casual/focused/strategic) 
3. Typical session length (short/medium/long)
4. Social preference (solo/coop/competitive)
5. Complexity preference (simple/moderate/complex)

Respond with a JSON object in this format:
{
  "mood": "${mood}",
  "energyLevel": "low|medium|high",
  "playStyle": "casual|focused|strategic", 
  "sessionLength": "short|medium|long",
  "socialPreference": "solo|coop|competitive",
  "complexityPreference": "simple|moderate|complex"
}
`;
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    model: 'llama2',
                    stream: false
                })
            });
            if (!response.ok) {
                throw new Error('Failed to analyze play with Ollama');
            }
            const result = await response.json();
            return JSON.parse(result.response);
        }
        catch (error) {
            console.error('Ollama analysis failed:', error);
            // Fallback analysis
            return {
                mood,
                energyLevel: 'medium',
                playStyle: 'casual',
                sessionLength: 'medium',
                socialPreference: 'solo',
                complexityPreference: 'moderate'
            };
        }
    }
    async getGameRecommendations(mood, playAnalysis, availableGames) {
        const prompt = `
You are a game recommendation expert. Based on the user's current mood and play analysis, suggest 5 games from their library that would be perfect matches.

User Mood: ${mood}
Energy Level: ${playAnalysis.energyLevel}
Play Style: ${playAnalysis.playStyle}
Session Length: ${playAnalysis.sessionLength}
Social Preference: ${playAnalysis.socialPreference}
Complexity Preference: ${playAnalysis.complexityPreference}

Available Games: ${availableGames.map(g => `${g.title} (${g.genres?.join(', ')})`).join('\n')}

Please recommend exactly 5 games with:
1. Perfect mood match
2. Energy level alignment  
3. Play style compatibility
4. Session length appropriate
5. Social preference match

Respond with a JSON array in this format:
[
  {
    "gameTitle": "Game Title",
    "reason": "Why this game matches",
    "confidence": 0.95,
    "moodFit": 0.9,
    "energyFit": 0.8
  }
]
`;
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    model: 'llama2',
                    stream: false
                })
            });
            if (!response.ok) {
                throw new Error('Failed to get recommendations from Ollama');
            }
            const result = await response.json();
            const recommendations = JSON.parse(result.response);
            // Map recommendations back to game objects
            return recommendations.map((rec, index) => ({
                game: availableGames.find(g => g.title === rec.gameTitle) || availableGames[index],
                reason: rec.reason,
                confidence: rec.confidence || 0.8,
                moodFit: rec.moodFit || 0.7,
                energyFit: rec.energyFit || 0.7
            }));
        }
        catch (error) {
            console.error('Ollama recommendation failed:', error);
            // Fallback: return first 5 games sorted by mood relevance
            return availableGames.slice(0, 5).map((game, index) => ({
                game,
                reason: `Available game matching ${mood} mood`,
                confidence: 0.6 - (index * 0.1),
                moodFit: 0.6 - (index * 0.1),
                energyFit: 0.5
            }));
        }
    }
}
exports.OllamaApi = OllamaApi;
exports.default = OllamaApi;
